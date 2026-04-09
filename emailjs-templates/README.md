# EmailJS Templates

Two templates — paste each HTML file into the corresponding EmailJS template editor.

## Setup steps

1. Go to https://dashboard.emailjs.com → Email Templates
2. Create **Template 1** → name it anything, note the Template ID
3. In the template editor, switch to **HTML** mode and paste `template_client.html`
4. Set **Subject** field to: `{{subject}}`
5. Save → copy the Template ID → set as `NEXT_PUBLIC_EMAILJS_TEMPLATE_CLIENT` in `.env.local`

6. Create **Template 2** → name it anything, note the Template ID
7. Paste `template_astrologer.html` in HTML mode
8. Set **Subject** field to: `{{subject}}`
9. Save → copy the Template ID → set as `NEXT_PUBLIC_EMAILJS_TEMPLATE_ASTROLOGER` in `.env.local`

10. Set `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID` to the same value as `NEXT_PUBLIC_EMAILJS_TEMPLATE_CLIENT`
    (the contact form reuses the client template)

## Template variables used

Both templates use exactly these 4 variables — EmailJS will substitute them at send time:

| Variable     | Description                        |
|--------------|------------------------------------|
| `{{to_name}}`  | Recipient's name                 |
| `{{to_email}}` | Recipient's email address        |
| `{{subject}}`  | Email subject line               |
| `{{message}}`  | Full email body text             |

## Which template handles what

### template_client (deep indigo + gold theme)
- Booking confirmed
- Booking cancelled
- Refund issued
- Session reminder (1 hour before)
- Kundali charts uploaded
- Session completed
- Contact form enquiry

### template_astrologer (indigo accent + admin badge)
- New booking alert
- Any future admin-only notifications

## Updating the domain

Replace all instances of `jyotishacharya.com` in both HTML files with your actual domain before pasting into EmailJS.
