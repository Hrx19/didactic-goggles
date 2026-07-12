# Paid Handbooks Guide

Use this flow when you want to sell a PDF/project handbook on the website.

1. Put the PDF inside `assets/notes/`.
2. Open `handbooks.json`.
3. Add a new object like this:

```json
{
  "productId": "project-handbook-1",
  "courseId": 0,
  "title": "Project Handbook",
  "subtitle": "Paid project handbook with practical steps and revision support.",
  "category": "Project Handbook",
  "price": 399,
  "originalAmount": 999,
  "currency": "INR",
  "fileName": "project-handbook.pdf",
  "downloadName": "humaixo-project-handbook.pdf",
  "status": "available"
}
```

Notes:
- `productId` must be unique.
- `fileName` must exactly match the PDF file inside `assets/notes/`.
- The PDF is not public. It downloads only after Razorpay payment verification returns a signed download link.
- Keep paid PDF files out of GitHub unless you intentionally want to publish them in the repository.
