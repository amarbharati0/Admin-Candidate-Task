## Packages
jspdf | PDF generation for candidate reports
jspdf-autotable | Table plugin for jspdf
recharts | Analytics charts for admin dashboard
date-fns | Date formatting and manipulation

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  body: ["var(--font-body)"],
}
Authentication uses cookie-based session (credentials: "include")
File uploads require FormData and POST to /api/submissions
