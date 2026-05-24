# DigiFlow Workflow Engine

## State Machine

```
                    ┌──────────┐
                    │  DRAFT   │
                    └────┬─────┘
                         │ Start Workflow
                         ▼
                    ┌──────────┐
              ┌────►│IN_PROGRESS│◄────┐
              │     └─────┬────┘     │
              │           │          │
              │     ┌─────▼─────┐    │
              │     │Recommender│    │
              │     │#1         │    │
              │     └──┬──┬─────┘    │
              │        │  │         │
              │   Return│  │Recommend│
              │        │  │         │
              │        │  ┌─────────▼──┐
              │        │  │Recommender │
              │        │  │#2          │
              │        │  └──┬──┬──────┘
              │        │     │  │
              │   Return│     │  │Recommend
              │        │     │  ┌─────────▼──┐
              │        │     │  │Recommender │
              │        │     │  │#N          │
              │        │     │  └──┬──┬──────┘
              │        │     │     │  │
              │   Return│     │Return│  │Recommend
              │        │     │     │  ┌─────────▼──┐
              │        │     │     │  │ Approver   │
              │        │     │     │  └──┬──┬──────┘
              │        │     │     │     │  │
              │   Return│     │     │Return│  │Approve
              │        │     │     │     │  ┌─────────▼──┐
              │        │     │     │     │  │ APPROVED   │
              │        │     │     │     │  └────────────┘
              ▼        ▼     ▼     ▼     ▼
         ┌────────┐
         │ RETURNED│ (revision → resubmit → re-enters workflow)
         └────────┘
```

## Conditional Routing Engine

Rules are evaluated BEFORE workflow starts:

```
1. User clicks "Start Workflow"
2. Cloud Function: evaluateRules(document)
3. Query routing_rules WHERE enabled=true
4. Sort by priority ASC
5. For each rule:
   a. Evaluate conditions against document fields
   b. If conditions match → execute actions
6. Return modified workflow chain
7. Workflow starts with modified chain
```

### Rule Conditions

| Operator | Example |
|---|---|
| eq | documentType == "Budget" |
| neq | documentType != "Memo" |
| gt | amount > 50000 |
| gte | amount >= 10000 |
| lt | amount < 5000 |
| lte | amount <= 25000 |
| contains | description contains "urgent" |
| in | department in ["Finance", "HR"] |
| is_true | isConfidential == true |

### Rule Actions

| Action | Effect |
|---|---|
| add_recommender | Add user to recommender chain |
| add_approver | Add user as additional approver |
| remove_recommender | Remove user from chain |
| skip_step | Skip a workflow step |
| set_confidential | Force confidential ON/OFF |
| set_priority | Set priority high/medium/low |
| notify | Send alert to specified users |
| block | Block workflow until manual review |

## Email Notification Flow

```
Workflow Started
  → Email to Recommender #1 with:
    [Recommend] [View Document] [View All Details]
  → If no response in 24hrs: Reminder email
  → If no response in 48hrs: Escalation to manager + admin

Recommender Recommends
  → Email to next recommender (if any)
  → Notification to creator: "X has recommended your document"

All Recommenders Done
  → Email to Approver with:
    [Approve] [Return] [View Document]

Approver Approves
  → PDF Conversion triggered
  → Email to creator: "Document approved" with download link
  → Push notification to creator

Weekly Executive Summary (Monday 9 AM)
  → To MD/CEO: total docs, avg time, SLA breaches, fastest approver
```
