# 2016 B2 Super Curation — Stage 4 Classification, Bank and Route Tables

## Classification revisions

| Source | Stage 2 initial classification | Stage 4 confirmed classification | Revision shown |
|---|---|---|---|
| Staff manual | A | A | confirmed |
| Staff meeting minutes | C | A + C | revised when the plough-policy evidence is reached |
| Ms Ip email | A | A | confirmed |
| Museum WhatsApp | B | B + C | revised when the approved toilet-announcement chain is reached |
| Resident interview | B | B | confirmed |
| 1983 article | B | B | confirmed |
| Visitor survey | C | C | confirmed |
| Ms O’Conner email | C | C | confirmed |

Stage 4 stamps are source/page status indicators. Lara's boss letter receives no Stage 4 stamp because it is an all-task instruction document and is outside the Stage 4 source boundary.

## Evidence-bank contract

| Task | Confirmed rows | Included | Excluded |
|:---:|---:|---|---|
| A | 12 | Loan-policy, transport, insurance, cover and final approved handling facts | Pending approval, rejected guard proposal, unverified photograph claims |
| B | 12 | Farmhouse discovery, village facts, cupboard survival and prayer evidence | Research links, source labels, resident biography, unverified or redundant details |
| C | 13 | Supported problems, incidents and approved/reliable remedies | Raw minority counts, blame language, email/report formatting, rejected or merely proposed measures |

Bank rows are derived from stable record IDs. Replaying a step cannot duplicate a row; moving backward removes rows that are no longer reached. A normal-motion commit creates at most one temporary source-to-bank clone and removes it after completion/timeout. Reduced motion produces the same row immediately with no clone.

## Source-route table

| Trigger | Destination | Return/use rule |
|---|---|---|
| “according to policy” in the minutes | Staff manual, page 4 | Use the exact policy clause; do not substitute the rejected security-guard proposal. |
| WhatsApp interview URL | Resident interview, page 8 | Read village and cupboard claims, then continue to the newspaper for confirmation. |
| “strange writing on left door” | Resident interview prayer/door exchange | Resolve right-versus-left before retaining the detail. |
| Resident flood/Typhoon prompts | 1983 newspaper article, page 9 | Use the contemporary report to confirm event and survival facts. |
| Minutes reference to the online survey | Visitor survey, page 9 | Compare all three responses for each issue; do not select a convenient isolated number. |
| Lara's toilet-door idea | Dr Jones's later WhatsApp approval | The route becomes a confirmed recommendation only after the approval message. |

Routes are represented by stable source records and exact destinations. If a target cannot be resolved exactly, the runtime records an audit failure and does not animate or select adjacent text.
