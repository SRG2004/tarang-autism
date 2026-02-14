# AWS Payment Method Troubleshooting - INVALID_PAYMENT_INSTRUMENT

## 🚨 Issue: INVALID_PAYMENT_INSTRUMENT Error

You're seeing this error when trying to access Bedrock models:
```
AccessDeniedExceptionModel access is denied due to INVALID_PAYMENT_INSTRUMENT: A valid payment instrument must be provided. Your AWS Marketplace subscription for this model cannot be completed at this time. If you recently fixed this issue, try again after 2 minutes.
```

## 🔍 What This Means

This error occurs when AWS cannot process payments through your current payment method. Common causes:
- Credit/debit card expired
- Insufficient funds
- Card blocked by bank
- Payment method not verified
- Regional payment restrictions
- AWS billing account issues

## 🛠️ Step-by-Step Resolution

### Step 1: Check Your Payment Method (5 minutes)

1. **Go to AWS Billing Console:**
   - Sign in to AWS Console
   - Search for "Billing" or go to https://console.aws.amazon.com/billing/
   - Click **"Payment methods"** in left sidebar

2. **Verify Current Payment Method:**
   - Check if your card is listed
   - Look for any warning icons or "Invalid" status
   - Verify expiration date
   - Check if it's set as "Default"

3. **Common Issues to Look For:**
   - ❌ Card expired
   - ❌ Card marked as "Invalid"
   - ❌ No default payment method set
   - ❌ Card from unsupported region

### Step 2: Update Payment Method

#### Option A: Update Existing Card
1. Click **"Actions"** → **"Edit"** next to your card
2. Update expiration date if needed
3. Re-enter CVV code
4. Click **"Update"**
5. Wait 2-3 minutes for verification

#### Option B: Add New Payment Method
1. Click **"Add payment method"**
2. Select **"Credit or debit card"**
3. Enter new card details:
   - Card number
   - Expiration date
   - CVV
   - Cardholder name
   - Billing address (must match bank records)
4. Click **"Add payment method"**
5. Set as **"Default"** if prompted

### Step 3: Verify Payment Method (2 minutes)

1. **Check Status:**
   - Payment method should show "Valid"
   - Should be marked as "Default"
   - No warning icons

2. **Test Small Charge:**
   - AWS may charge ₹2 for verification
   - This will be refunded automatically
   - Check your bank account/SMS for verification

### Step 4: Wait and Retry (5-10 minutes)

**Important:** AWS needs time to process payment method updates.

1. **Wait 5-10 minutes** after updating payment method
2. **Clear browser cache** (optional but recommended)
3. **Try Bedrock access again**

### Step 5: Test Bedrock Access

#### Option A: Via AWS Console
1. Go to **Bedrock** → **Model catalog**
2. Search for **"Claude 3.5 Sonnet"**
3. Click **"Open in Playground"**
4. Try a simple prompt: "Hello, how are you?"

#### Option B: Via Your Application
1. Deploy your TARANG app
2. Try the clinical summary generation
3. Check logs for any errors

## 🏦 Bank-Specific Issues

### If Your Bank Blocks AWS Charges

**Common with Indian Banks:**
- SBI, HDFC, ICICI sometimes block international charges
- AWS charges appear as "Amazon Web Services"

**Solutions:**
1. **Call your bank** and whitelist AWS charges
2. **Enable international transactions** on your card
3. **Use a different card** (Visa/Mastercard work better than RuPay)
4. **Try a business credit card** if available

### Recommended Card Types for AWS India
✅ **Best Options:**
- HDFC Bank Credit Cards
- ICICI Bank Credit Cards  
- Axis Bank Credit Cards
- American Express
- International Visa/Mastercard

❌ **Avoid:**
- RuPay cards (limited international support)
- Prepaid cards
- Virtual cards (some don't work)

## 🌍 Regional Considerations

### For Indian Users
- Use cards issued by Indian banks
- Ensure international transactions are enabled
- Some banks require pre-approval for AWS charges
- Consider business accounts for better limits

### Billing Address
- Must match your bank records exactly
- Use the same address as your card statement
- Include proper PIN code and state

## 🔄 Alternative Solutions

### Option 1: AWS Credits
1. Check if you have AWS credits available
2. Go to **Billing** → **Credits**
3. Credits can cover Bedrock usage temporarily

### Option 2: Different AWS Account
1. Create new AWS account with different payment method
2. Transfer your resources (if needed)
3. Use family member's card (with permission)

### Option 3: AWS Support
1. Go to **Support** → **Create case**
2. Select **"Account and billing support"**
3. Describe the payment method issue
4. AWS support is free for billing issues

## ⏱️ Timeline Expectations

| Action | Time Required |
|--------|---------------|
| Update payment method | 2-3 minutes |
| AWS verification | 5-10 minutes |
| Bank processing | 10-30 minutes |
| Bedrock access retry | Immediate after verification |

## 🧪 Testing Steps

### 1. Verify Payment Method Fixed
```bash
# Check AWS CLI access
aws sts get-caller-identity

# Should return your account info without errors
```

### 2. Test Bedrock Access
```bash
# Test Bedrock via CLI
aws bedrock-runtime invoke-model \
  --model-id anthropic.claude-3-sonnet-20240229-v1:0 \
  --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}' \
  --region us-east-1 \
  output.json

# Check output.json for response
cat output.json
```

### 3. Test Your Application
```bash
# Test your TARANG API
curl -X POST https://your-app-runner-url/clinical/generate-summary \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"patient_data": {"age": 3}, "risk_results": {"total_score": 8}}'
```

## 🚨 If Still Not Working

### Check These Common Issues:

1. **Wrong Region:**
   - Bedrock requires `us-east-1`
   - Your payment method should work globally

2. **IAM Permissions:**
   - Verify `AmazonBedrockFullAccess` policy
   - Check if user has marketplace permissions

3. **Account Limits:**
   - New AWS accounts sometimes have restrictions
   - Contact AWS support to lift limits

4. **Service Quotas:**
   - Check Bedrock service quotas
   - Request increases if needed

### Contact AWS Support

**When to Contact:**
- Payment method shows "Valid" but still getting errors
- Multiple cards failing
- Account-specific restrictions

**How to Contact:**
1. Go to **Support Center**
2. Click **"Create case"**
3. Select **"Account and billing support"**
4. Choose **"Payment method"** category
5. Describe the issue with error message

**Information to Provide:**
- Error message: `INVALID_PAYMENT_INSTRUMENT`
- Service: Amazon Bedrock
- Model: Claude 3.5 Sonnet
- Region: us-east-1
- Payment method type (Visa/Mastercard/etc.)
- Country: India

## 💡 Prevention Tips

### For Future
1. **Set up billing alerts** at $10, $50, $100
2. **Monitor payment method expiration**
3. **Keep backup payment method**
4. **Enable auto-pay** for small amounts
5. **Use business credit cards** for better limits

### Best Practices
- Update payment methods before expiration
- Whitelist AWS charges with your bank
- Keep multiple payment methods on file
- Monitor AWS billing dashboard regularly

## ✅ Success Indicators

You'll know it's fixed when:
- ✅ Payment method shows "Valid" status
- ✅ No warning icons in billing console
- ✅ Bedrock playground works
- ✅ Your TARANG app generates clinical summaries
- ✅ No more `INVALID_PAYMENT_INSTRUMENT` errors

## 📞 Emergency Contacts

### AWS Support (Free for Billing)
- **Console:** https://console.aws.amazon.com/support/
- **Phone:** Available in support console
- **Chat:** Available 24/7 for billing issues

### Your Bank
- Call the number on back of your card
- Ask to enable international transactions
- Whitelist "Amazon Web Services" charges

---

## 🎯 Quick Action Plan

**Right Now (5 minutes):**
1. Go to AWS Billing → Payment methods
2. Check if card is valid and set as default
3. Update expiration date if needed
4. Add new card if current one is invalid

**Wait (10 minutes):**
5. Let AWS process the payment method update
6. Clear browser cache

**Test (2 minutes):**
7. Try Bedrock in AWS Console playground
8. Test your TARANG application

**If Still Failing:**
9. Contact your bank to enable international transactions
10. Create AWS support case for billing issue

---

**Most Common Resolution:** Update payment method + wait 10 minutes = Fixed! 🎉
