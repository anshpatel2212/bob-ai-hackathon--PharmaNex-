# Solution Overview

## What We Built

PharmaGuard AI is an AI-assisted pharmaceutical safety and regulatory submission-readiness platform. It gives pharmacovigilance and regulatory users one place to work with adverse-event information, analyze available safety evidence, upload CTD documents, identify missing or incomplete sections, and review an overall submission-readiness picture.

The platform is designed as decision support. It provides structured evidence and recommendations while keeping qualified human professionals responsible for final safety and regulatory decisions.

## How It Works

### Regulatory Gap Detection

1. The user signs in securely and uploads CTD documents.
2. PharmaGuard AI extracts readable content from supported documents.
3. The system detects CTD section codes and headings from the actual document content.
4. Detected content is mapped to applicable CTD requirements.
5. Each section is evaluated as present, partial, missing, not applicable, or requiring review.
6. The system records supporting evidence such as document, page, and text snippet where available.
7. Missing and incomplete requirements are converted into prioritized gaps.
8. The platform generates recommendations for human review.
9. Regulatory readiness is calculated dynamically from the analyzed sections.
10. The results are displayed through filters, module summaries, evidence panels, and readiness indicators.

### Safety Signal Analysis

1. The user provides adverse-event data.
2. The backend validates and normalizes the records.
3. Available safety evidence is analyzed using the application's signal-analysis logic.
4. Statistical measures are used when the available data supports meaningful calculation.
5. The resulting evidence is classified into an appropriate risk/evidence category.
6. Findings are shown on the safety intelligence dashboard and can be used for reporting.

## Architecture Diagram

> See [`architecture.md`](architecture.md) for the detailed architecture.

```text
[User / Browser]
       |
       v
[React + Vite Frontend]
       |
       | REST API / Auth
       v
[FastAPI Backend]
       |
       +--------------------+
       |                    |
       v                    v
[PostgreSQL]       [Document Processing]
                            |
                            v
                    [CTD Section Mapping]
                            |
                            v
                      [Gap Detection]
                            |
                            v
                  [Readiness Calculation]
       |
       v
[Safety Signal Analysis]
       |
       +--------------------+
                            |
                            v
                    [Dashboard / Reports]
```

## Key Design Decisions

| Decision | Rationale |
|---|---|
| Separate React frontend and FastAPI backend | Keeps UI and business logic independently deployable and easier to maintain. |
| PostgreSQL for persistent data | Provides structured relational storage for users, documents, analyses, gaps, signals, and reports. |
| Evidence-based CTD detection | Prevents the Gap Detection feature from depending only on filenames or hardcoded gap counts. |
| Dynamic readiness scoring | Makes readiness change when the user's actual document set changes. |
| Explicit uncertainty states | `PARTIAL` and `REVIEW_REQUIRED` prevent uncertain AI results from being presented as definitive. |
| JWT-based authentication | Protects user-specific APIs and supports data isolation between users. |
| Human review workflow | AI-assisted findings should support, not replace, qualified regulatory judgment. |
| Liquid Glass enterprise UI | Provides a modern, clear interface while keeping safety and regulatory information visually prioritized. |

## IBM Technologies Used

- **IBM Bob:** Used as the AI-assisted development environment/tooling during the creation and iteration of the PharmaGuard AI application.
- **IBM watsonx.ai:** Not claimed as a production runtime dependency unless the corresponding integration is actually enabled and configured in the submitted repository.

## Responsible AI / Regulatory Position

PharmaGuard AI is a hackathon prototype and should be treated as decision-support software.

The platform does not independently determine regulatory compliance or replace qualified review. CTD applicability can vary by region, product, and submission type, and safety analyses can be limited by the quantity and quality of available data.
