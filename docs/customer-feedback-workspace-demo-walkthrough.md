# NPS Me Customer Feedback Workspace — Demo Walkthrough

This walkthrough is for demonstrating the NPS Me Customer Feedback Workspace to a prospective customer, friendly tester or early pilot user.

## Demo objective

Show that NPS Me can turn raw customer feedback data into:

- A private workspace
- Saved datasets
- NPS performance views
- Response exploration
- AI-assisted insight
- Close-the-loop follow-up actions

The goal is not to present NPS Me as a fully self-serve enterprise SaaS platform. The goal is to show a practical, implementation-led product that helps a startup or SME move from scattered feedback to action.

## 1. Start with the customer problem

Suggested talk track:

> Most teams collect customer feedback somewhere — Intercom, forms, spreadsheets, survey tools, CSV exports — but the feedback often sits there. Scores are reviewed, but comments are not consistently acted on. Detractor follow-up happens manually, and leadership does not always have a clear view of themes, risks or next actions.

Then explain:

> NPS Me is designed as a practical layer on top of the tools you already use. It gives you a private workspace where feedback can be imported, analysed and turned into close-the-loop actions.

## 2. Show the productised offer page

Open:

~~~txt
https://www.npsme.com/customer-feedback-workspace
~~~

Show:

- Private customer feedback workspace positioning
- What you get
- Who it is for
- Setup from £2,500
- Optional monthly support
- Book a setup discussion CTA

Talk track:

> This is not positioned as vague consulting or a heavy CX platform. It is a practical setup: workspace, first import, analysis, insight and close-the-loop workflow.

## 3. Show workspace login

Open:

~~~txt
https://www.npsme.com/workspace/login
~~~

Explain:

- Each customer has individual user accounts.
- Users have roles such as owner, admin and member.
- Passwords are hashed.
- Workspace data is scoped to the logged-in workspace.

Avoid showing real customer data during demos unless authorised.

## 4. Show empty workspace onboarding

Log in as a test customer with no datasets if available.

Open:

~~~txt
/workspace
~~~

Show:

- First-run onboarding
- Import first dataset CTA
- Account setup link
- Data protection reminder
- Current setup/status card

Talk track:

> For a new customer, the workspace starts with clear first steps. The aim is to make the first import and review process straightforward.

## 5. Show the import page

Open:

~~~txt
/workspace/import
~~~

Show:

- Data protection reminder
- Sample CSV template download
- Paste/upload-style input
- Example data
- Analyse feedback button

Talk track:

> The customer can start with a CSV or JSON-style export. For early customers, NPS Me supports the first import to make sure the data is mapped correctly.

Click:

~~~txt
Analyse feedback
~~~

Show:

- Import summary
- NPS score
- Promoters/passives/detractors
- Detected fields
- Normalised responses

## 6. Save the dataset

Enter or accept a dataset name.

Click:

~~~txt
Save dataset
~~~

Show the post-save buttons:

- Open performance
- View responses
- Open close-the-loop
- View all datasets

Talk track:

> Once saved, the dataset becomes reusable. It is no longer just a browser session. It can be reopened for performance, response review and follow-up actions.

## 7. Show performance view

Click:

~~~txt
Open performance
~~~

Show:

- NPS score
- Distribution
- Bucket counts
- Any available charts or summary sections

Talk track:

> This gives the team a simple readout of the customer feedback dataset. The key point is not just the score, but what sits behind it.

## 8. Show responses view

Click or navigate to:

~~~txt
/workspace/datasets/[datasetId]/responses
~~~

Show:

- Individual responses
- Scores
- Buckets
- Comments
- Customer fields where present and authorised

Talk track:

> This is where teams can review actual customer language, not just the NPS number.

## 9. Show AI-assisted insights

If the dataset page includes AI insights, click:

~~~txt
Generate insights
~~~

Show:

- Executive summary
- NPS readout
- Key themes
- CX risks
- Recommended actions
- Close-the-loop templates if available

Talk track:

> The AI summary is assistive. It helps surface themes and recommended actions quickly, but it should still be reviewed by a human. We also minimise what is sent for AI analysis and avoid unnecessary direct identifiers.

## 10. Show close-the-loop workflow

Open:

~~~txt
/workspace/datasets/[datasetId]/closing-the-loop
~~~

Show:

- Detractors / responses needing attention
- Action status
- Owner
- Action taken
- Update workflow

Talk track:

> This is where feedback becomes operational. Instead of simply reporting NPS, the team can track who is following up, what has been done and which issues remain open.

## 11. Show saved datasets

Open:

~~~txt
/workspace/datasets
~~~

Show:

- Dataset cards
- Performance/responses/close-loop buttons
- Delete behaviour

Explain role handling:

- Owner/admin can delete datasets.
- Member can view/import/analyse but cannot delete.
- Backend also blocks unauthorised delete attempts.

## 12. Show account page

Open:

~~~txt
/workspace/account
~~~

Show:

- User details
- Workspace ID
- Role
- Role permissions
- Change password
- Logout

Talk track:

> This is still a lightweight early workspace, but it already has individual login access, roles and password management.

## 13. Data protection points to mention

Mention briefly:

- Customer should only upload data they are authorised to process.
- Names/emails are useful for follow-up but not always required.
- Anonymised IDs may be enough for some analysis.
- Workspace data is access-controlled.
- AI outputs are assistive and should be reviewed.
- Privacy policy is available at `/privacy`.
- A formal data processing agreement may be added for paid customers.

## 14. Suggested closing question

Ask:

> If we took one of your current feedback exports, could this help your team review the results and decide who needs follow-up?

Then ask:

> Would you prefer to start with a simple CSV import pilot, or should we look at the system where your feedback currently lives?

## 15. Demo checklist

Before a demo:

- Confirm the demo account works.
- Confirm sample CSV link works.
- Confirm import works.
- Confirm save dataset works.
- Confirm post-save buttons work.
- Confirm performance page loads.
- Confirm responses page loads.
- Confirm close-loop page loads.
- Confirm AI insights work.
- Confirm member delete restriction works if demonstrating roles.
- Remove any real customer data unless authorised.

## 16. Demo warning

Do not demo real customer names, emails or comments unless you have permission.

Use:

- Fake sample data
- Anonymised data
- A friendly customer dataset only if explicitly authorised
