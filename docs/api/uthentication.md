## Send OTP

POST /api/v1/auth/send-otp

Request:

{
  "phone": "09123456789"
}


## Verify OTP

POST /api/v1/auth/verify-otp

Request:

{
  "phone": "09123456789",
  "otp": "123456"
}