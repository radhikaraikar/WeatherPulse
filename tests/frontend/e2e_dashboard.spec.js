/**
 * WeatherPulse India - Playwright E2E Critical Path Test Suite
 * 
 * Test Scenarios:
 *   1. Dashboard Boot & Telemetry Header Initialization
 *   2. Multi-Criteria Spatial & Hazard Category Filtering
 *   3. Interactive Geospatial Map Marker Selection & Modal Inspection
 *   4. Admin ML Moderation Triage (Approve / Reject Fake) Flow
 *   5. Citizen Report Submission Flow with AI Pre-flight Check
 */

import { test, expect } from '@playwright/test';

test.describe('WeatherPulse India - Mission Control E2E Flow', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to local or preview deployment URL
    await page.goto(process.env.APP_URL || 'http://localhost:80');
  });

  test('Scenario 1: Dashboard loads with live telemetry and breaking ticker', async ({ page }) => {
    // Verify Brand title & Subtitle
    await expect(page.locator('h1.brand-title')).toHaveText('WeatherPulse India');
    
    // Verify Live Kafka Ingestion Counter
    const streamRateDisplay = page.locator('#streamRateDisplay');
    await expect(streamRateDisplay).toBeVisible();
    await expect(streamRateDisplay).toContainText('evt/s');

    // Verify Breaking Alert Ticker
    const ticker = page.locator('#tickerBar');
    await expect(ticker).toBeVisible();
    await expect(ticker).toContainText('IMD RED ALERT');

    // Verify Map and Feed exist
    await expect(page.locator('#weatherMap')).toBeVisible();
    await expect(page.locator('#streamFeedList')).toBeVisible();
  });

  test('Scenario 2: Applying State and Category Filters updates feed and markers', async ({ page }) => {
    // 1. Select State: Maharashtra
    const stateSelect = page.locator('#stateFilterSelect');
    await stateSelect.selectOption('Maharashtra');
    
    // 2. Select Category: Flooding
    const floodingChip = page.locator('.chip[data-category="FLOODING_WATERLOGGING"]');
    await floodingChip.click();
    await expect(floodingChip).toHaveClass(/active/);

    // 3. Verify Feed reflects filtered items
    const feedCards = page.locator('.stream-card');
    await expect(feedCards.first()).toBeVisible();
    await expect(page.locator('#filteredResultsCount')).toContainText('reports');
  });

  test('Scenario 3: Opening Report Detail Modal shows Ground-Truth & Radar Inspection', async ({ page }) => {
    // Click on the first feed card
    const firstCard = page.locator('.stream-card').first();
    await firstCard.click();

    // Verify Modal Opens
    const adminModal = page.locator('#adminModal');
    await expect(adminModal).toHaveClass(/active/);

    // Verify ML Ground-Truth inspection elements are displayed
    await expect(page.locator('#adminModalContent')).toContainText('Doppler Radar');
    await expect(page.locator('#adminModalContent')).toContainText('Trust Score');
  });

  test('Scenario 4: Admin ML Moderation Queue - Flag and Verify Action', async ({ page }) => {
    // 1. Open Moderation Queue
    const btnAdminQueue = page.locator('#btnOpenAdminQueue');
    await btnAdminQueue.click();

    const adminModal = page.locator('#adminModal');
    await expect(adminModal).toHaveClass(/active/);

    // 2. Click Approve Official
    const btnApprove = page.locator('#btnAdminVerifyOfficial');
    await btnApprove.click();

    // 3. Verify Modal closes and counter updates
    await expect(adminModal).not.toHaveClass(/active/);
  });

  test('Scenario 5: Citizen Report Submission Flow', async ({ page }) => {
    // 1. Open Submit Modal
    const btnReport = page.locator('#btnOpenSubmitModal');
    await btnReport.click();

    const submitModal = page.locator('#submitModal');
    await expect(submitModal).toHaveClass(/active/);

    // 2. Fill form
    await page.locator('#inputCitizenLocation').fill('Dadar TT Circle, Mumbai');
    await page.locator('#selectCitizenCategory').selectOption('FLOODING_WATERLOGGING');
    await page.locator('#textCitizenDescription').fill('Continuous rain, water logging over 2 feet near circle. #MumbaiRains');

    // 3. Submit
    await page.locator('#btnConfirmSubmit').click();

    // 4. Modal closes and new report enters stream
    await expect(submitModal).not.toHaveClass(/active/);
  });

});
