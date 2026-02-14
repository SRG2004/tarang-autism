# Coding Conventions — TARANG

## Python / FastAPI

### Boto3 Best Practices
- Always initialize clients in `__init__`, never at module level.
- Use `try/except ClientError` for all AWS API calls — never let a service outage crash the app.
- Read region from `os.getenv("AWS_REGION", "ap-south-1")`.
- Use `boto3.client()` (not `resource()`) for Bedrock, Transcribe, Polly, and HealthLake.
- Prefer `invoke_model` for Bedrock, not `invoke_model_with_response_stream`.

### Pydantic Validation
- All API request bodies MUST use Pydantic `BaseModel` with field constraints.
- Use `Field(ge=0, le=10)` for bounded scores.
- Never pass raw `dict` between layers — always validate through a schema.

### Error Handling Pattern
```python
try:
    result = aws_client.some_operation(...)
except ClientError as e:
    logger.error(f"AWS error: {e.response['Error']['Code']}")
    return fallback_result
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    return fallback_result
```

### Role-Based Access
- Use `require_role(current_user, ["CLINICIAN", "ADMIN"])` for all protected endpoints.
- Canonical roles: `PARENT`, `CLINICIAN`, `ADMIN` (uppercase, case-insensitive check).
- Never use `"doctor"` — this role does not exist.

## TypeScript / Next.js

### API Calls
- All `fetch()` calls use `process.env.NEXT_PUBLIC_API_URL` — never hardcode URLs.
- Include `Authorization: Bearer ${token}` header for authenticated requests.
- Always wrap in `try/catch` with user-facing error messages.

### State Management
- Use React Context (`AuthContext`) for auth state.
- Use local `useState` for component state — avoid Zustand for new features.

## File Naming
- Python: `snake_case.py`
- TypeScript: `kebab-case.tsx` for pages, `PascalCase.tsx` for components
- AWS config files: `.kiro/steering/*.md`, `specs/*.md`

## Commit Messages
- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring
- `chore:` Maintenance
- `docs:` Documentation
