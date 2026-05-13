# NPS Me Workspace Customer Onboarding

This checklist is for manually onboarding an early NPS Me workspace customer.

## 1. Create the workspace and owner user

From the project root:

~~~bash
node src/scripts/create-workspace-user.mjs \
  --workspace-name "Customer Company Ltd" \
  --workspace-slug "customer-company" \
  --email "owner@customer.com" \
  --full-name "Customer Owner" \
  --role "owner"
~~~

The script should create or reuse the workspace, create or update the user, link the user to the workspace, and print a temporary password.

## 2. Send login details to the customer

Send the customer:

~~~txt
Login URL: https://www.npsme.com/workspace/login
Email: owner@customer.com
Temporary password: [generated password]
~~~

Ask them to change their password immediately at:

~~~txt
https://www.npsme.com/workspace/account
~~~

## 3. Customer first actions

Ask the customer to:

1. Log in.
2. Change their temporary password.
3. Go to Import.
4. Download the sample CSV template.
5. Prepare their feedback data.
6. Import and analyse the data.
7. Save the dataset.
8. Open performance, responses, and close-the-loop views.

## 4. Data protection reminder

Before importing data, remind the customer:

~~~txt
Only upload customer feedback data you are authorised to process.
Avoid unnecessary sensitive data.
Use anonymised IDs where names/emails are not needed.
~~~

## 5. Add additional users

To add another user to the same workspace:

~~~bash
node src/scripts/create-workspace-user.mjs \
  --workspace-name "Customer Company Ltd" \
  --workspace-slug "customer-company" \
  --email "member@customer.com" \
  --full-name "Customer Member" \
  --role "member"
~~~

Recommended roles:

~~~txt
owner: main customer account holder; can delete datasets
admin: trusted manager; can delete datasets
member: standard user; can import/view/analyse, but cannot delete datasets
~~~

## 6. Internal verification

After creating the customer workspace:

- Confirm the owner can log in.
- Confirm the owner can change password.
- Confirm the workspace is empty on first login.
- Confirm the owner can import and save a dataset.
- Confirm the owner can delete a dataset.
- Confirm a member can import and save a dataset.
- Confirm a member cannot delete a dataset.
- Confirm data does not appear in another workspace.

## 7. Useful customer links

~~~txt
Workspace login:
https://www.npsme.com/workspace/login

Workspace overview:
https://www.npsme.com/workspace

Import feedback:
https://www.npsme.com/workspace/import

Saved datasets:
https://www.npsme.com/workspace/datasets

Account/password:
https://www.npsme.com/workspace/account

Privacy policy:
https://www.npsme.com/privacy

Sample CSV:
https://www.npsme.com/samples/nps-feedback-template.csv
~~~

## 8. First support call checklist

On the first support/demo call:

- Confirm what feedback source they are using.
- Confirm whether names/emails are needed or whether anonymised IDs are enough.
- Help them map columns to NPS Me fields.
- Import the first dataset together.
- Review the NPS score and distribution.
- Open responses and identify key comments.
- Open close-the-loop and agree who owns follow-up.
- Explain that AI insights are assistive and should be reviewed by a human.
