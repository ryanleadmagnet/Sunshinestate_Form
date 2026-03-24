# Google Sheets Connection Setup Guide

This guide explains how to connect your Sunshine State Solar form to a Google Sheet using a Service Account.

## 1. Create a Google Cloud Project & Service Account
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a **New Project**.
3.  Go to **APIs & Services > Library** and search for **"Google Sheets API"**. Click **Enable**.
4.  Go to **APIs & Services > Credentials**.
5.  Click **Create Credentials** and select **Service Account**.
6.  Give it a name (e.g., `solar-form-sa`) and click **Create and Continue**. Skip the optional steps and click **Done**.
7.  Click on the newly created Service Account email.
8.  Go to the **Keys** tab, click **Add Key > Create new key**, and select **JSON**. Download this file.

## 2. Prepare Your Google Sheet
1.  Create a new [Google Sheet](https://docs.google.com/spreadsheets/).
2.  Copy the **Spreadsheet ID** from the URL:
    `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
3.  On the first row, create the following headers:
    `Timestamp`, `Residency`, `HomeAge`, `ExistingSolar`, `Shading`, `Usage`, `PowerBill`, `SystemSize`, `Battery`, `Postcode`, `FirstName`, `LastName`, `Email`, `Phone`
4.  **Important:** Click **Share** on the Google Sheet and add your **Service Account Email** (from step 1.5) as an **Editor**.

## 3. Configure Environment Variables
Create a file named `.env.local` in the root of your project and add theFollowing values from your JSON key file:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa-email@project-id.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYourGeneratedKey\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEET_ID=your_spreadsheet_id_from_url
```

*Note: Make sure the Private Key is wrapped in quotes and uses `\n` for newlines.*

## 4. Run Locally
Restart your development server:
```bash
npm run dev
```

Any new form submissions will now be appended as rows to your Google Sheet.
