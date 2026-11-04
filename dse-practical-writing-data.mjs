export const learningUnits = [
  {
    id: 'enquiry', number: '01', title: 'Letter of Enquiry', zhTitle: '查詢信',
    purpose: 'Ask for product, service or arrangement details in a formal and precise way.',
    purposeZh: '以正式而精確的語氣，查詢產品、服務或安排的詳情。',
    structure: [
      ['State who you are and why you are writing.', '交代身分及寫信目的。'],
      ['Group questions by topic instead of listing them randomly.', '按主題整理問題，避免把查詢事項隨意堆砌。'],
      ['Give relevant quantities, dates and constraints.', '清楚交代數量、日期及限制。'],
      ['Invite clarification and close with thanks.', '邀請對方補充資料，並以致謝作結。']
    ],
    expressions: [
      ['I am writing to enquire about…', '本人現函查詢……'],
      ['Could you please confirm whether…?', '可否請您確認……？'],
      ['We would also appreciate further information regarding…', '如能提供更多有關……的資料，我們將不勝感激。'],
      ['I look forward to your favourable reply.', '期待收到您的正面回覆。']
    ]
  },
  {
    id: 'bad-news-email', number: '02', title: 'Negative Email', zhTitle: '壞消息電郵',
    purpose: 'Deliver unavoidable bad news, offer a workable alternative and protect the relationship.',
    purposeZh: '交代無法避免的壞消息，提出可行替代方案，同時維持良好關係。',
    structure: [
      ['State the problem promptly and give a concise reason.', '直接交代問題，並簡潔說明原因。'],
      ['Explain the practical consequence.', '說明事情造成的實際影響。'],
      ['Offer a specific alternative with timing.', '提出具體替代方案及時間安排。'],
      ['Apologise, thank the reader and offer follow-up help.', '致歉、感謝對方，並表示願意跟進。']
    ],
    expressions: [
      ['I regret to inform you that…', '很遺憾通知您……'],
      ['To minimise the inconvenience, I propose that…', '為盡量減少不便，我建議……'],
      ['Please accept my sincere apologies for…', '對於……，謹此致以誠摯歉意。']
    ]
  },
  {
    id: 'reply', number: '03', title: 'Letter of Reply', zhTitle: '回覆信',
    purpose: 'Answer every enquiry completely, accurately and in the same logical order.',
    purposeZh: '完整而準確地回應每項查詢，並保持清晰的邏輯次序。',
    structure: [
      ['Thank the reader and identify the enquiry.', '感謝來函，並指出所回覆的查詢。'],
      ['Answer requirements, arrangements and benefits in separate paragraphs.', '分段交代要求、安排及好處。'],
      ['Highlight exceptions, deadlines and conditions.', '清楚標示例外情況、截止日期及條件。'],
      ['Encourage participation and invite further questions.', '鼓勵參與，並歡迎對方再作查詢。']
    ],
    expressions: [
      ['Thank you for your enquiry regarding…', '感謝您查詢有關……的資料。'],
      ['Please note that…', '請注意……'],
      ['Should you require further information, please do not hesitate to contact us.', '如需更多資料，歡迎隨時與我們聯絡。']
    ]
  },
  {
    id: 'report', number: '04', title: 'Report', zhTitle: '報告',
    purpose: 'Present findings objectively and turn evidence into clear recommendations.',
    purposeZh: '客觀呈現調查結果，並根據證據提出清晰建議。',
    structure: [
      ['Use a precise title and functional headings.', '使用準確標題及功能清晰的小標題。'],
      ['Separate findings, analysis and recommendations.', '把調查結果、分析及建議分開處理。'],
      ['Support claims with figures or observed evidence.', '以數據或觀察所得支持論點。'],
      ['End with prioritised, feasible action.', '以有優先次序而且可行的行動方案作結。']
    ],
    expressions: [
      ['The purpose of this report is to…', '本報告旨在……'],
      ['The findings indicate that…', '調查結果顯示……'],
      ['It is therefore recommended that…', '因此，建議……']
    ]
  },
  {
    id: 'proposal', number: '05', title: 'Proposal', zhTitle: '建議書',
    purpose: 'Recommend a future plan, justify each change and identify decisions still required.',
    purposeZh: '提出未來計劃，解釋每項改動的理據，並指出仍待決定的事項。',
    structure: [
      ['Open with the aim and scope of the proposal.', '開首交代建議書的目的及範圍。'],
      ['Organise additions, removals and modifications under headings.', '以小標題整理新增、刪除及修改項目。'],
      ['Explain the expected benefit of each proposal.', '說明每項建議的預期好處。'],
      ['List matters for discussion and close with the overall impact.', '列出待商議事項，並以整體成效作結。']
    ],
    expressions: [
      ['This proposal outlines…', '本建議書概述……'],
      ['To improve…, it is proposed that…', '為改善……，現建議……'],
      ['The following matters require further discussion.', '以下事項仍有待進一步商議。']
    ]
  },
  {
    id: 'formal-request', number: '06', title: 'Letter of Request', zhTitle: '正式請求信',
    purpose: 'Request changes politely while explaining why they are necessary and what follows next.',
    purposeZh: '以禮貌語氣要求作出改動，說明必要性及後續安排。',
    structure: [
      ['Identify the arrangement that needs to change.', '指出需要修改的安排。'],
      ['Present each request with a practical reason.', '每項請求均配以實際理據。'],
      ['State the follow-up action after confirmation.', '交代確認改動後的跟進工作。'],
      ['Thank the recipient and request confirmation.', '感謝對方，並請對方確認安排。']
    ],
    expressions: [
      ['I am writing to request several adjustments to…', '本人現函要求就……作出數項調整。'],
      ['We would appreciate it if you could…', '如蒙安排……，我們將不勝感激。'],
      ['I look forward to receiving your confirmation.', '期待收到您的確認。']
    ]
  },
  {
    id: 'promotional-article', number: '07', title: 'Promotional Article', zhTitle: '宣傳文章',
    purpose: 'Turn factual information into an energetic invitation without losing accuracy.',
    purposeZh: '把資料轉化成具感染力的邀請，同時保持內容準確。',
    structure: [
      ['Use an appealing headline and hook.', '使用吸引的標題及開場。'],
      ['Group highlights into memorable sections.', '把賣點分成容易記憶的段落。'],
      ['Introduce guests, benefits and special offers accurately.', '準確介紹嘉賓、好處及優惠。'],
      ['Finish with a clear call to action.', '以明確行動呼籲作結。']
    ],
    expressions: [
      ['Have you ever dreamed of…?', '你可曾夢想過……？'],
      ['Get ready for…', '準備迎接……'],
      ['Do not miss this extraordinary opportunity to…', '切勿錯過這個……的難得機會。']
    ]
  },
  {
    id: 'invite-spokesperson', number: '08', title: 'Invitation — Spokesperson', zhTitle: '邀請信：擔任代言人',
    purpose: 'Invite a respected person by connecting their experience with the organisation’s mission.',
    purposeZh: '把受邀者的經驗與機構使命連結起來，正式邀請對方出任代表。',
    structure: [
      ['State the role, duration and event date immediately.', '立即交代角色、任期及活動日期。'],
      ['Explain why this person is especially suitable.', '說明對方特別合適的原因。'],
      ['Show the organisation’s achievements and purpose.', '展示機構的成果及宗旨。'],
      ['Describe duties, hospitality and practical support.', '交代職責、款待及實際支援。']
    ],
    expressions: [
      ['On behalf of…, I am delighted to invite you to…', '本人謹代表……，誠邀您……'],
      ['Given your longstanding commitment to…, we believe…', '鑑於您長期致力於……，我們相信……'],
      ['We would be honoured if you could…', '如蒙您……，我們將深感榮幸。']
    ]
  },
  {
    id: 'invite-winners', number: '09', title: 'Invitation — Winners', zhTitle: '邀請信：得獎者',
    purpose: 'Congratulate winners and guide them through a timed event in a clear chronological sequence.',
    purposeZh: '恭賀得獎者，並按時間順序清楚交代活動流程。',
    structure: [
      ['Congratulate and identify the event.', '恭賀得獎者並指出活動。'],
      ['Move through morning, activities, ceremony and departure in order.', '依次交代早上安排、活動、頒獎禮及離場。'],
      ['Include exact times, locations, transport and awards.', '列明時間、地點、交通及獎項。'],
      ['End with anticipation and contact information.', '以期待見面及聯絡方法作結。']
    ],
    expressions: [
      ['Congratulations on winning…!', '恭喜你在……中勝出！'],
      ['The day begins at…', '當日活動將於……開始。'],
      ['The highlight comes at…', '活動高潮將於……開始。']
    ]
  },
  {
    id: 'informal-request', number: '10', title: 'Informal Letter of Request', zhTitle: '非正式請求信',
    purpose: 'Suggest necessary changes to someone familiar while remaining supportive and tactful.',
    purposeZh: '向熟悉的人提出必要改動，同時保持支持及體諒的語氣。',
    structure: [
      ['Open warmly and recognise the reader’s effort.', '以親切語氣開首，肯定對方付出的努力。'],
      ['Explain each problem before suggesting a change.', '先說明問題，再提出改動。'],
      ['Use questions and inclusive language to soften requests.', '運用問句及共同語氣，使請求更婉轉。'],
      ['Offer help and end with encouragement.', '主動提供協助，並以鼓勵作結。']
    ],
    expressions: [
      ['Thanks so much for all the effort you have put into…', '非常感謝你為……付出的努力。'],
      ['Could we…?', '我們可否……？'],
      ['I am more than happy to help with…', '我非常樂意協助……']
    ]
  },
  {
    id: 'press-release', number: '11', title: 'Press Release', zhTitle: '新聞稿',
    purpose: 'Respond publicly to allegations with verifiable facts, reassurance and a controlled tone.',
    purposeZh: '以可核實的資料、安撫性的說明及克制語氣，公開回應指控。',
    structure: [
      ['Identify the allegations without repeating them sensationally.', '指出指控，但避免以煽情方式重複。'],
      ['Answer each claim with evidence.', '逐項以證據回應。'],
      ['Explain current policy and follow-up action.', '說明現行政策及跟進措施。'],
      ['Reaffirm standards and close formally.', '重申機構標準，並以正式格式作結。']
    ],
    expressions: [
      ['We wish to address recent allegations concerning…', '我們現就近期有關……的指控作出回應。'],
      ['Contrary to claims that…, the available evidence shows…', '有關……的說法與事實不符，現有證據顯示……'],
      ['We remain committed to…', '我們將繼續致力於……']
    ]
  },
  {
    id: 'speech', number: '12', title: 'Speech', zhTitle: '演講辭',
    purpose: 'Connect an audience emotionally while moving through a clear story, evidence and future vision.',
    purposeZh: '以清晰故事、具體成果及未來願景打動聽眾。',
    structure: [
      ['Address the audience and express appreciation.', '向聽眾致意並表達感謝。'],
      ['Tell the personal or organisational journey.', '交代個人或機構歷程。'],
      ['Use concrete growth figures and acknowledge contributors.', '以具體增長數據呈現成果，並肯定貢獻者。'],
      ['End with a memorable shared vision.', '以令人深刻的共同願景作結。']
    ],
    expressions: [
      ['Tonight, as we celebrate…, I would like to…', '今晚，在我們慶祝……之際，我希望……'],
      ['What began with… has grown into…', '由最初的……，發展成今天的……'],
      ['Together, we have transformed… into…', '我們攜手把……轉化成……']
    ]
  },
  {
    id: 'outline', number: '13', title: 'Informative Article / Outline', zhTitle: '資料文章與寫作大綱',
    purpose: 'Convert a dense data file into an objective article with a disciplined outline.',
    purposeZh: '把繁複資料整理成有嚴謹大綱的客觀文章。',
    structure: [
      ['Select a headline that names the issue and direction.', '標題須同時點出議題及文章方向。'],
      ['Plan one clear function for each section.', '每一節只負責一項清晰功能。'],
      ['Compare figures accurately and explain their significance.', '準確比較數據，並解釋其意義。'],
      ['Distinguish established facts from qualified predictions.', '區分已確立的事實與附帶條件的預測。']
    ],
    expressions: [
      ['In 2022 alone,…', '單在 2022 年，……'],
      ['According to the survey,…', '根據該項調查，……'],
      ['Research suggests that…, although…', '研究顯示……，但……']
    ]
  }
];

export const practiceMissions = [
  {
    id: 'workshop-enquiry', number: '01', type: 'Letter of Enquiry', zhType: '查詢信',
    title: 'Educational Technology Workshop Enquiry', zhTitle: '教育科技工作坊查詢',
    situation: `You are Chris Lee, Student Activities Coordinator of Sunrise Secondary School. Write a formal letter to FutureTech Academy to enquire about arranging an educational technology workshop for your students.`,
    situationZh: `你是 Sunrise Secondary School 學生活動統籌主任 Chris Lee。請致函 FutureTech Academy，正式查詢為學生安排教育科技工作坊的詳情。`,
    requirements: [
      { heading: 'Workshop information', zhHeading: '工作坊資料', points: [
        [`Enquire about available dates, participation fees and venue arrangements.`, `查詢可供選擇的日期、參加費用及場地安排。`],
        [`Request details of the advanced workshop session.`, `索取進階工作坊的詳細資料。`]
      ]},
      { heading: 'Group arrangements', zhHeading: '團體安排', points: [
        [`Ask whether 80 students can attend a workshop before July.`, `查詢能否在 7 月前安排 80 名學生參加工作坊。`],
        [`Check whether 20 advanced-session places are available.`, `查詢進階課程能否提供 20 個名額。`],
        [`Ask whether a group-booking discount is available.`, `查詢是否提供團體預訂折扣。`]
      ]},
      { heading: 'Closing', zhHeading: '結語', points: [
        [`Thank the organisation and request a reply. Sign as Chris Lee.`, `感謝機構並請對方回覆。署名 Chris Lee。`]
      ]}
    ],
    expressions: [
      [`I am writing on behalf of… to enquire about…`, `本人謹代表……，現函查詢……`],
      [`We would be grateful if you could provide information regarding…`, `如能提供有關……的資料，我們將不勝感激。`],
      [`Given the substantial number of participants…`, `鑑於參加人數眾多……`]
    ],
    model: {
      en: `Dear Sir/Madam,\n\nI am writing on behalf of Sunrise Secondary School to enquire about the educational technology workshops offered by FutureTech Academy. Our school hopes to arrange a workshop for students before July.\n\nWe would be grateful if you could provide information regarding the available workshop dates, participation fees and venue arrangements. We would also appreciate further details concerning the advanced workshop session, including its content and duration.\n\nOur school plans to register 80 students for the main workshop. As we hope to hold it before July, could you please confirm whether a suitable date is available? We would also like to enquire about the availability of 20 places in the advanced session. Given the substantial number of participants, we would appreciate it if a group-booking discount could be offered.\n\nThank you for your time and consideration. We look forward to your reply.\n\nYours faithfully,\nChris Lee\nStudent Activities Coordinator\nSunrise Secondary School`,
      zh: `敬啟者：\n\n本人謹代表 Sunrise Secondary School，現函查詢 FutureTech Academy 提供的教育科技工作坊。本校希望在 7 月前為學生安排一場工作坊。\n\n如能提供可供選擇的工作坊日期、參加費用及場地安排，我們將不勝感激。我們亦希望索取進階工作坊的進一步資料，包括課程內容及時長。\n\n本校計劃為 80 名學生報名參加主要工作坊。由於我們希望在 7 月前舉行活動，煩請確認是否仍有合適日期。我們亦想查詢進階課程能否提供 20 個名額。鑑於參加人數眾多，如能提供團體預訂折扣，我們將深表感謝。\n\n感謝貴機構撥冗考慮，期待收到回覆。\n\n此致\nChris Lee\n學生活動統籌主任\nSunrise Secondary School`
    }
  },
  {
    id: 'absence-presentation', number: '02', type: 'Bad News Email', zhType: '壞消息電郵',
    title: 'Absence from a Group Presentation', zhTitle: '未能出席小組匯報',
    situation: `You are Alex Wong, a BBA student. You have an urgent family matter and cannot attend tomorrow's group presentation or deliver your assigned part in person. Write a formal email to your lecturer, Ms Taylor, to explain the situation and request an alternative arrangement.`,
    situationZh: `你是工商管理學士學生 Alex Wong。由於有緊急家庭事務，你未能出席明天的小組匯報，也無法親身負責原定部分。請寫一封正式電郵給講師 Taylor 女士，解釋情況並要求替代安排。`,
    requirements: [
      { heading: 'Reason for absence', zhHeading: '缺席原因', points: [
        [`Accompany a family member to an important medical appointment.`, `陪同家人出席一個重要醫療預約。`],
        [`Cannot attend the presentation or present your assigned part in person.`, `未能出席匯報或親身講解負責部分。`]
      ]},
      { heading: 'Alternative arrangement', zhHeading: '替代安排', points: [
        [`Your slides are ready; record your part and email the video and slides tonight.`, `簡報已經完成；今晚錄製負責部分，並以電郵傳送影片及簡報。`],
        [`Ask Ms Taylor to accept the arrangement.`, `請 Taylor 女士接納這項安排。`]
      ]},
      { heading: 'Closing', zhHeading: '結語', points: [
        [`Apologise, thank her and offer to catch up on missed coursework.`, `致歉、致謝，並表示願意補回缺席期間的課業。`],
        [`Sign as Alex Wong, BBA Student, UID 284 162 395.`, `署名 Alex Wong，BBA Student，學生編號 284 162 395。`]
      ]}
    ],
    expressions: [
      [`I regret to inform you that…`, `很遺憾通知您……`],
      [`To ensure that my absence does not affect…, I will…`, `為確保我的缺席不會影響……，我將……`],
      [`I would be grateful if you could accept…`, `如蒙接納……，本人將不勝感激。`]
    ],
    model: {
      en: `Dear Ms Taylor,\n\nI regret to inform you that I am unable to attend tomorrow's group presentation as I need to accompany a family member to an important medical appointment. As a result, I will also be unable to deliver my assigned part of the presentation in person as originally scheduled.\n\nTo ensure that my absence does not affect the group presentation, I will record a video presentation of my assigned part and email you the recording together with my completed presentation slides tonight. I would be grateful if you could accept this alternative arrangement.\n\nPlease accept my sincere apologies for any inconvenience this may cause. Thank you for your understanding and consideration. I am willing to catch up on any coursework I may miss during my absence.\n\nYours sincerely,\nAlex Wong\nBBA Student\nStudent UID: 284 162 395`,
      zh: `Taylor 女士：\n\n很遺憾通知您，我需要陪同一名家人出席重要醫療預約，因此未能出席明天的小組匯報。故此，我亦無法按原定安排親身講解自己負責的部分。\n\n為確保我的缺席不會影響小組匯報，我會錄製自己負責部分的影片，並於今晚把影片連同已完成的簡報電郵給您。如蒙接納這項替代安排，本人將不勝感激。\n\n此事可能造成不便，謹此致以誠摯歉意。感謝您的體諒及考慮。我願意補回缺席期間可能錯過的任何課業。\n\n此致\nAlex Wong\n工商管理學士學生\n學生編號：284 162 395`
    }
  },
  {
    id: 'photography-reply', number: '03', type: 'Letter of Reply', zhType: '回覆信',
    title: 'Youth Photography Competition Enquiry', zhTitle: '青年攝影比賽查詢',
    situation: `You are Natalie Cheung of the Hong Kong Youth Photography Association. Reply formally to a secondary school student's enquiry about entry requirements, submission arrangements and the award ceremony.`,
    situationZh: `你是香港青年攝影協會職員 Natalie Cheung。請正式回覆一名中學生，交代參賽要求、遞交安排及頒獎禮詳情。`,
    requirements: [
      { heading: 'Requirements', zhHeading: '參賽要求', points: [
        [`Open to students aged 12–18; maximum three original photographs.`, `公開予 12 至 18 歲中學生參加；每人最多遞交三張原創照片。`],
        [`AI-edited photographs are not accepted.`, `不接受經人工智能修改的照片。`]
      ]},
      { heading: 'Submission', zhHeading: '遞交安排', points: [
        [`Upload through the official website by 30 September.`, `於 9 月 30 日前經官方網站上載。`],
        [`Add a description of no more than 100 words; participation is free.`, `每張照片附上不多於 100 字的說明；參加費用全免。`]
      ]},
      { heading: 'Awards', zhHeading: '獎項', points: [
        [`First prize: HK$5,000 camera; ten entries displayed publicly.`, `冠軍可獲價值港幣 5,000 元的相機；十份優秀作品將公開展出。`],
        [`Photographer Daniel Ho shares techniques at the ceremony.`, `攝影師 Daniel Ho 將在頒獎禮分享攝影技巧。`]
      ]}
    ],
    expressions: [
      [`Thank you for your enquiry about…`, `感謝你查詢有關……的資料。`],
      [`Please note that…`, `請注意……`],
      [`Should you require further information…`, `如需更多資料……`]
    ],
    model: {
      en: `RE: Enquiry about the Youth Photography Competition\n\nDear Sir/Madam,\n\nThank you for your enquiry about the Youth Photography Competition organised by the Hong Kong Youth Photography Association. We are pleased to provide further information regarding the competition requirements, submission arrangements and awards.\n\nThe competition is open to secondary school students aged 12 to 18, with each participant allowed to submit a maximum of three photographs. All entries must be original works taken by the participants themselves. Please note that photographs edited using artificial intelligence will not be accepted.\n\nAll entries must be uploaded to our official website by 30 September. Each photograph should be accompanied by a description of no more than 100 words. No entry fee is required. The first-prize winner will receive a camera worth HK$5,000, while ten outstanding entries will be selected for display at a public exhibition. Professional photographer Daniel Ho will also share practical photography techniques at the award ceremony.\n\nWe sincerely appreciate your interest and encourage you to take part. Should you require further information, please do not hesitate to contact us.\n\nYours faithfully,\nNatalie Cheung\nHong Kong Youth Photography Association`,
      zh: `主旨：青年攝影比賽查詢\n\n敬啟者：\n\n感謝你查詢由香港青年攝影協會舉辦的青年攝影比賽。我們很樂意提供比賽要求、遞交安排及獎項的進一步資料。\n\n比賽公開予 12 至 18 歲中學生參加，每位參賽者最多可遞交三張照片。所有作品必須由參賽者親自拍攝並屬原創作品。請注意，我們不接受經人工智能修改的照片。\n\n所有作品須於 9 月 30 日前上載至本會官方網站。每張照片應附上不多於 100 字的說明，參加費用全免。冠軍可獲價值港幣 5,000 元的相機，另有十份優秀作品會在公開展覽中展出。專業攝影師 Daniel Ho 亦會在頒獎禮分享實用攝影技巧。\n\n我們衷心感謝你對比賽的興趣，並鼓勵你參加。如需更多資料，歡迎隨時與我們聯絡。\n\n此致\nNatalie Cheung\n香港青年攝影協會`
    }
  },
  {
    id: 'online-learning-report', number: '04', type: 'Formal Report', zhType: '正式報告',
    title: `Problems with a School's Online Learning System`, zhTitle: '學校網上學習系統問題報告',
    situation: `You are a member of the Student IT Support Team at Bright Future Secondary School. Write a formal report on technical and security problems in the school's new online learning platform, recommend improvements and suggest features that enhance independent learning.`,
    situationZh: `你是 Bright Future Secondary School 學生資訊科技支援組成員。請就學校新網上學習平台的技術及保安問題撰寫正式報告，提出改善方法，並建議有助學生自主學習的新功能。`,
    requirements: [
      { heading: 'Technical and security problems', zhHeading: '技術及保安問題', points: [
        [`Frequent login difficulties and unsupported learning-material file formats.`, `學生經常無法登入；部分教材使用學生無法開啟的檔案格式。`],
        [`Assignments have disappeared, and personal information is accessible without proper authorisation.`, `部分網上功課消失；個人資料可在未獲適當授權下被查閱。`]
      ]},
      { heading: 'Recommendations', zhHeading: '建議', points: [
        [`Add password recovery, common file-format rules and automatic backups.`, `加入密碼重設功能、規定使用常見檔案格式，並設置自動備份。`],
        [`Introduce two-factor authentication.`, `引入雙重認證以加強帳戶保安。`]
      ]},
      { heading: 'Additional features', zhHeading: '新增功能', points: [
        [`Add a discussion forum and a progress-tracking tool.`, `加入網上討論區及學習進度追蹤工具。`],
        [`Make the platform more convenient and effective for independent learning.`, `提升平台的便利性及自主學習成效。`]
      ]}
    ],
    expressions: [
      [`This report outlines the… issues identified…`, `本報告概述所發現的……問題。`],
      [`Several concerns have emerged since…`, `自……推出以來，出現了數項問題。`],
      [`To address these issues, … should be implemented.`, `為處理上述問題，應落實……`],
      [`Implementing these measures would improve…`, `落實上述措施將可改善……`]
    ],
    model: {
      en: `Report on Improvements to the School's Online Learning System\n\nIntroduction\nThis report outlines the technical and security issues identified following the introduction of the online learning platform at Bright Future Secondary School and proposes measures to address them, alongside recommendations for additional features.\n\nKey Findings\nSeveral concerns have emerged since the platform was introduced. Students frequently experienced difficulties logging into their accounts, while some teachers uploaded learning materials in unsupported file formats. Furthermore, several online assignments disappeared from students' accounts, and certain personal information was found to be accessible without proper authorisation, posing potential data security risks.\n\nRecommendations\nTo address these issues, a password recovery system should be introduced to help students regain access to their accounts, and teachers should be required to upload materials in commonly supported file formats. An automatic backup system should also be implemented to prevent assignment loss. Additionally, two-factor authentication should be introduced to strengthen account security and prevent unauthorised access.\n\nProposed Additions\nTo enhance students' learning experience, an online discussion forum and a progress-tracking tool are recommended, allowing students to exchange ideas, monitor their academic performance and study more independently.\n\nConclusion\nImplementing these measures would improve the platform's reliability and security while contributing to a more convenient and effective online learning experience.`,
      zh: `改善學校網上學習系統報告\n\n引言\n本報告概述 Bright Future Secondary School 推出網上學習平台後所發現的技術及保安問題，提出相應改善措施，並建議加入新功能。\n\n主要發現\n平台推出後出現了數項問題。學生經常無法登入帳戶，部分教師則上載了平台不支援的檔案格式。此外，若干網上功課從學生帳戶中消失，部分個人資料亦可在未獲適當授權下被查閱，構成潛在數據保安風險。\n\n建議\n為處理上述問題，平台應加入密碼重設系統，協助學生重新取得帳戶使用權，並規定教師使用普遍支援的檔案格式上載資料。平台亦應設置自動備份，以免功課遺失。此外，系統應引入雙重認證，加強帳戶保安並防止未經授權的存取。\n\n建議新增功能\n為提升學生的學習體驗，建議加入網上討論區及學習進度追蹤工具，讓學生交流意見、掌握學業表現，並更有效地自主學習。\n\n結論\n落實上述措施將提升平台的可靠性及安全性，同時建立更方便而有效的網上學習體驗。`
    }
  },
  {
    id: 'school-recycling', number: '05', type: 'Proposal', zhType: '建議書',
    title: 'Improving a School Recycling Programme', zhTitle: '改善學校回收計劃',
    situation: `You are a member of Greenfield Secondary School's Environmental Protection Committee. Write a formal proposal recommending improvements to waste management and identifying matters for the next committee meeting.`,
    situationZh: `你是 Greenfield Secondary School 環境保護委員會成員。請撰寫正式建議書，提出改善廢物管理的方法，並指出下次委員會會議需要討論的事項。`,
    requirements: [
      { heading: 'Add', zhHeading: '新增', points: [
        [`Recycling bins on every floor; monthly second-hand book exchange; expert workshops.`, `每層設置回收箱；每月舉辦二手書交換；由保育專家主持工作坊。`]
      ]},
      { heading: 'Remove / modify', zhHeading: '刪除與修改', points: [
        [`Remove single-use cutlery, printed circulars and outdated posters.`, `取消即棄餐具、印刷通告及過時海報。`],
        [`Use biodegradable packaging and collect waste daily.`, `改用可生物降解包裝，並每日收集廢物。`]
      ]},
      { heading: 'Discuss', zhHeading: '待商議', points: [
        [`HK$20,000 budget, monitoring groups and launch date.`, `港幣 20,000 元預算、監察小組及推出日期。`]
      ]}
    ],
    expressions: [
      [`This proposal outlines…`, `本建議書概述……`],
      [`To promote…, it is recommended that…`, `為推動……，現建議……`],
      [`The next committee meeting should address…`, `下次委員會會議應商討……`]
    ],
    model: {
      en: `Proposal on Improving the School Recycling Programme\n\nIntroduction\nThis proposal outlines recommended additions, removals and modifications to the recycling programme at Greenfield Secondary School, alongside matters requiring further discussion.\n\nProposed Additions\nRecycling bins for paper, plastic and metal should be installed on every floor, while a monthly second-hand book exchange programme could be introduced. Environmental workshops led by local conservation experts are also recommended.\n\nProposed Removals and Modifications\nAll single-use plastic cutlery should be removed from the canteen. Printed circulars should be discontinued and outdated recycling posters removed. Plastic packaging in the tuck shop could be replaced with biodegradable alternatives, while daily waste collection should replace the current weekly schedule.\n\nMatters for Discussion\nThe next committee meeting should address the proposed HK$20,000 budget, the student groups responsible for monitoring recycling stations and the launch date.\n\nConclusion\nImplementing these changes could reduce waste, promote environmental awareness and create a more sustainable school environment.`,
      zh: `改善學校回收計劃建議書\n\n引言\n本建議書概述 Greenfield Secondary School 回收計劃的新增、刪除及修改項目，並列出有待進一步商議的事項。\n\n建議新增項目\n學校應在每層設置紙張、塑膠及金屬回收箱，並可推行每月二手書交換計劃。學校亦宜邀請本地保育專家主持環保工作坊。\n\n建議刪除及修改項目\n飯堂應取消所有即棄塑膠餐具。學校亦應停止派發印刷通告，並移除課室壁報板上的過時回收海報。小食部可用可生物降解物料取代塑膠包裝，而每日收集廢物的安排應取代現時每週一次的時間表。\n\n待商議事項\n下次委員會會議應商討港幣 20,000 元的預算、負責監察回收站的學生組別，以及改善計劃的推出日期。\n\n結論\n落實上述改動可減少廢物、提高環保意識，並建立更可持續的校園環境。`
    }
  },
  {
    id: 'training-request', number: '06', type: 'Letter of Request', zhType: '正式請求信',
    title: 'Changes to a Staff Training Programme', zhTitle: '修改員工培訓計劃',
    situation: `You are Marcus Lee of Bright Future Technology Company. Write to the Training Coordinator, Mr Roberts, requesting changes to next month's staff training programme.`,
    situationZh: `你是 Bright Future Technology Company 職員 Marcus Lee。請致函培訓統籌員 Roberts 先生，要求修改下月的員工培訓計劃。`,
    requirements: [
      { heading: 'Requested changes', zhHeading: '要求改動', points: [
        [`Postpone the programme because departments have urgent projects.`, `由於多個部門正處理緊急項目，要求延後培訓。`],
        [`Replace incompatible software and shorten each session because of workload.`, `更換不兼容的軟件，並因員工工作繁重而縮短每節培訓。`]
      ]},
      { heading: 'Follow-up', zhHeading: '跟進', points: [
        [`Send the revised schedule to Human Resources.`, `把修訂時間表交予人力資源部。`],
        [`Present the updated plan to department heads for approval.`, `把更新計劃交由各部門主管審批。`]
      ]}
    ],
    expressions: [
      [`We would appreciate it if the programme could be postponed.`, `如能延後培訓計劃，我們將不勝感激。`],
      [`Could you consider selecting a suitable alternative?`, `可否考慮選用合適的替代方案？`],
      [`Once the revised arrangements have been confirmed…`, `修訂安排一經確認……`]
    ],
    model: {
      en: `Request for Adjustments to the Staff Training Programme\n\nDear Mr Roberts,\n\nI am writing to request several adjustments to next month's staff training programme to ensure its smooth implementation.\n\nAs several departments are currently handling urgent projects, we would appreciate it if the programme could be postponed. Given the compatibility issues with the proposed software, could you also consider selecting a suitable alternative? We would be grateful if each training session could be shortened, as many employees have expressed concerns about their heavy workloads.\n\nOnce the revised arrangements have been confirmed, please forward the updated schedule to Human Resources. The updated plan should also be presented to all department heads at the next management meeting for approval.\n\nThank you for your continued efforts. I would greatly appreciate your assistance and look forward to receiving your confirmation.\n\nYours sincerely,\nMarcus Lee`,
      zh: `主旨：要求調整員工培訓計劃\n\nRoberts 先生：\n\n本人現函要求就下月員工培訓計劃作出數項調整，以確保計劃順利推行。\n\n由於多個部門現正處理緊急項目，如能延後培訓計劃，我們將不勝感激。鑑於建議軟件與公司電腦系統並不兼容，可否考慮選用合適的替代軟件？不少員工亦對繁重工作表示憂慮，如能縮短每節培訓時間，我們同樣深表感謝。\n\n修訂安排一經確認，請把更新的培訓時間表交予人力資源部。更新計劃亦應在下次管理層會議上交由各部門主管審批。\n\n感謝你一直努力籌辦培訓。期待得到你的協助及確認。\n\n此致\nMarcus Lee`
    }
  },
  {
    id: 'space-exhibition', number: '07', type: 'Promotional Article', zhType: '宣傳文章',
    title: 'Beyond Earth: Journey into Space', zhTitle: '《超越地球：太空之旅》展覽',
    situation: `You write for a youth magazine. Promote an interactive space exhibition by introducing its theme, attractions, guests and ticket offer.`,
    situationZh: `你是青年雜誌撰稿員。請介紹互動太空展覽的主題、景點、嘉賓及門票優惠，鼓勵年輕讀者參觀。`,
    requirements: [
      { heading: 'Highlights', zhHeading: '展覽亮點', points: [
        [`Simulated Mars journey, Moon VR zone, asteroid robotic arm and spacecraft replica.`, `火星模擬旅程、月球虛擬實境區、小行星機械臂及太空船複製品。`]
      ]},
      { heading: 'Guests', zhHeading: '特別嘉賓', points: [
        [`Astrophysicist Dr Emily Chan, former astronaut Michael Lee and YouTuber Jason Wong.`, `天體物理學家 Emily Chan 博士、前太空人 Michael Lee 及科學網紅 Jason Wong。`]
      ]},
      { heading: 'Offer', zhHeading: '優惠', points: [
        [`Use SPACE26 at spacediscovery.hk for HK$20 off, up to three tickets.`, `於 spacediscovery.hk 輸入 SPACE26，每張票減港幣 20 元，每本雜誌最多三張。`]
      ]}
    ],
    expressions: [
      [`Have you ever dreamed of…?`, `你可曾夢想過……？`],
      [`An out-of-this-world experience`, `一場超越想像的太空體驗`],
      [`Your space adventure starts here!`, `你的太空冒險由此開始！`]
    ],
    model: {
      en: `Beyond Earth: Your Ultimate Space Adventure Awaits!\n\nHave you ever dreamed of walking on the Moon or exploring distant planets? Get ready for Beyond Earth: Journey into Space, an interactive exhibition organised by the Hong Kong Science Discovery Centre.\n\nThe exhibition begins with a simulated mission to Mars. In the virtual reality zone, you can explore the Moon like a real astronaut. A robotic arm lets you collect samples from a simulated asteroid, while a spacecraft replica reveals how humans travel through space.\n\nRenowned astrophysicist Dr Emily Chan will discuss life beyond Earth. Former astronaut Michael Lee will share his experiences of living in space, and science YouTuber Jason Wong will demonstrate exciting experiments.\n\nVisit www.spacediscovery.hk and enter SPACE26 to enjoy HK$20 off each ticket, with up to three discounted tickets per magazine copy. Do not miss this extraordinary opportunity. Your space adventure starts here!`,
      zh: `超越地球：終極太空冒險正等待你！\n\n你可曾夢想漫步月球或探索遙遠行星？準備投入由香港科學探索中心舉辦的互動展覽《超越地球：太空之旅》。\n\n旅程由火星模擬任務開始。在虛擬實境區，你可像真正太空人一樣探索月球；你亦可操作機械臂，從模擬小行星採集樣本，並透過太空船複製品了解人類如何穿越太空。\n\n著名天體物理學家 Emily Chan 博士將講解地球以外的生命。前太空人 Michael Lee 會分享太空生活經驗，科學網紅 Jason Wong 則會示範刺激的太空實驗。\n\n前往 www.spacediscovery.hk 並輸入 SPACE26，每張門票即可減港幣 20 元；每本雜誌最多可購買三張優惠票。切勿錯過這次難得機會，你的太空冒險由此開始！`
    }
  },
  {
    id: 'reading-ambassador', number: '08', type: 'Invitation — Spokesperson', zhType: '邀請信：擔任代言人',
    title: 'Invitation to Become a Reading Ambassador', zhTitle: '邀請擔任閱讀大使',
    situation: `You are Michelle Lee of the Hong Kong Youth Reading Foundation. Invite children's author Mr Chan to serve as reading ambassador for one year and attend the launch ceremony on 18 August.`,
    situationZh: `你是香港青年閱讀基金會社區參與部職員 Michelle Lee。請邀請兒童文學作家 Chan 先生出任為期一年的閱讀大使，並出席 8 月 18 日的啟動禮。`,
    requirements: [
      { heading: 'Why him', zhHeading: '邀請原因', points: [
        [`Over ten years promoting children's literacy and a passion for youth reading.`, `推廣兒童讀寫能力逾十年，並熱心鼓勵青少年閱讀。`],
        [`Foundation: 15 mobile libraries and workshops with six schools.`, `基金會已設立 15 間流動圖書館，並與六所學校合辦閱讀工作坊。`]
      ]},
      { heading: 'Ceremony', zhHeading: '啟動禮', points: [
        [`Invite him to speak about his writing journey and the importance of reading.`, `邀請他分享寫作歷程及閱讀的重要性。`],
        [`Offer lunch and a private car service on request.`, `提供午餐，並可按需要安排專車。`]
      ]}
    ],
    expressions: [
      [`On behalf of…, I am delighted to invite you to…`, `本人謹代表……，誠邀您……`],
      [`Given your longstanding commitment to…`, `鑑於您長期致力於……`],
      [`We would be honoured if you could deliver…`, `如蒙您發表……，我們將深感榮幸。`]
    ],
    model: {
      en: `Invitation to Serve as Reading Ambassador and Attend the Campaign Launch Ceremony\n\nDear Mr Chan,\n\nOn behalf of the Hong Kong Youth Reading Foundation, I am delighted to invite you to serve as our reading ambassador for one year and attend the launch ceremony of our new reading campaign on 18 August.\n\nGiven your longstanding commitment to promoting children's literacy, we believe you would be an ideal representative. Our foundation has established 15 mobile libraries in underserved communities and is collaborating with six local schools to organise reading workshops. Your involvement would strengthen our efforts to improve literacy skills and promote lifelong reading habits.\n\nAt the ceremony, we would be honoured if you could deliver a speech about your writing journey and the importance of reading. You are also invited to a complimentary lunch with teachers and fellow guests. A private car service can be arranged upon request.\n\nWe sincerely hope you will accept our invitation and look forward to your favourable reply.\n\nYours sincerely,\nMichelle Lee\nHong Kong Youth Reading Foundation`,
      zh: `邀請出任閱讀大使及出席閱讀計劃啟動禮\n\nChan 先生：\n\n本人謹代表香港青年閱讀基金會，誠邀您出任為期一年的閱讀大使，並出席 8 月 18 日舉行的新閱讀計劃啟動禮。\n\n鑑於您長期致力推廣兒童讀寫能力，我們相信您是代表本會閱讀工作最理想的人選。本會已在資源不足的社區設立 15 間流動圖書館，並正與六所本地學校合作舉辦閱讀工作坊。您的參與定能加強我們提升青少年讀寫能力及培養終身閱讀習慣的工作。\n\n啟動禮上，如蒙您分享個人寫作歷程及閱讀的重要性，我們將深感榮幸。我們亦誠邀您與教師及其他嘉賓享用午餐；如有需要，本會可安排專車接送。\n\n我們衷心希望您接受邀請，並期待收到您的正面回覆。\n\n此致\nMichelle Lee\n香港青年閱讀基金會`
    }
  },
  {
    id: 'innovation-winners', number: '09', type: 'Invitation — Winners', zhType: '邀請信：得獎者',
    title: 'Young Inventors Technology Experience Day', zhTitle: '青年發明家科技體驗日',
    situation: `You are Natalie Wong of FutureTech Innovation Centre. Congratulate 25 Young Inventors Challenge winners and invite them to an exclusive technology experience day on 18 June.`,
    situationZh: `你是 FutureTech Innovation Centre 公共關係部職員 Natalie Wong。請恭賀「青年發明家挑戰賽」的 25 名得獎者，並邀請他們出席 6 月 18 日的科技體驗日。`,
    requirements: [
      { heading: 'Morning', zhHeading: '上午安排', points: [
        [`8:15 breakfast at Kowloon Tong; shuttle and safety briefing.`, `上午 8 時 15 分在九龍塘享用早餐；其後乘接駁車並接受安全簡介。`],
        [`10:30 arrival; robotics lab, VR zone and AI facility; lunch at 12:30.`, `上午 10 時 30 分抵達；參觀機械人實驗室、虛擬實境區及人工智能設施；下午 12 時 30 分午膳。`]
      ]},
      { heading: 'Awards and departure', zhHeading: '頒獎及離場', points: [
        [`2:45 ceremony; HK$10,000 scholarship valid for approved courses within two years.`, `下午 2 時 45 分頒獎；港幣 10,000 元獎學金可於兩年內修讀認可科技課程。`],
        [`Professor David Lau attends; event ends at 4:30 with shuttle to the MTR.`, `David Lau 教授將出席；活動下午 4 時 30 分結束，並提供往港鐵站的接駁車。`]
      ]}
    ],
    expressions: [
      [`Congratulations on winning…!`, `恭喜你在……中勝出！`],
      [`Following breakfast, our shuttle bus will…`, `早餐後，本會接駁車將……`],
      [`The highlight comes at…`, `活動高潮將於……開始。`]
    ],
    model: {
      en: `Congratulations! Invitation to the Young Inventors Challenge Technology Experience Day\n\nDear Prize Winners,\n\nCongratulations on winning the Young Inventors Challenge! We are delighted to invite all 25 winners to an exclusive technology experience day on 18 June.\n\nThe day begins at 8:15 a.m. with breakfast at the Innovation Hub in Kowloon Tong. Our shuttle bus will then take you to the FutureTech Research Centre, with a safety briefing en route.\n\nUpon arrival at 10:30 a.m., you will explore a humanoid robotics laboratory, a virtual reality simulation zone and an artificial intelligence research facility. Lunch will be served at 12:30 p.m.\n\nAt 2:45 p.m., each winner will receive a HK$10,000 technology scholarship, valid for approved courses within two years. Professor David Lau will attend the ceremony and join you for photographs. The event ends at 4:30 p.m., with a complimentary shuttle to Kowloon Tong MTR Station.\n\nWe look forward to celebrating your achievements with you.\n\nYours faithfully,\nNatalie Wong\nFutureTech Innovation Centre`,
      zh: `恭喜得獎！誠邀出席青年發明家挑戰賽科技體驗日\n\n各位得獎者：\n\n恭喜各位在「青年發明家挑戰賽」中勝出！我們誠邀全部 25 名得獎者出席 6 月 18 日舉行的專屬科技體驗日。\n\n活動於上午 8 時 15 分開始，參加者先在九龍塘 Innovation Hub 享用早餐，其後乘接駁車前往 FutureTech Research Centre，並於途中接受安全簡介。\n\n上午 10 時 30 分抵達後，你們將參觀人形機械人實驗室、虛擬實境模擬區及人工智能研究設施。午餐將於下午 12 時 30 分供應。\n\n下午 2 時 45 分，每位得獎者將獲頒港幣 10,000 元科技獎學金，可於兩年內用作修讀認可科技課程。David Lau 教授將出席頒獎禮並與大家合照。活動於下午 4 時 30 分結束，屆時將提供免費接駁車前往九龍塘港鐵站。\n\n我們期待與你們一同慶祝這項成就。\n\n此致\nNatalie Wong\nFutureTech Innovation Centre`
    }
  },
  {
    id: 'charity-bazaar', number: '10', type: 'Informal Letter', zhType: '非正式書信',
    title: 'Suggestions for a School Charity Bazaar', zhTitle: '改善學校慈善義賣會的建議',
    situation: `You are Jason. Write an encouraging informal letter to your friend Chloe, thanking her and suggesting practical improvements to the school charity bazaar.`,
    situationZh: `你是 Jason。請寫一封鼓勵性的非正式書信給朋友 Chloe，感謝她的努力，並提出改善學校慈善義賣會的實際建議。`,
    requirements: [
      { heading: 'Fundraising', zhHeading: '籌款活動', points: [
        [`Replace the clothes stall with crafts; reduce game booths from eight to five.`, `把二手衣物攤位改為手作攤位；把遊戲攤位由八個減至五個。`],
        [`Place a donation box near the entrance.`, `在入口附近設置捐款箱。`]
      ]},
      { heading: 'Publicity', zhHeading: '宣傳', points: [
        [`Cut the video from six minutes to two.`, `把宣傳影片由六分鐘縮短至兩分鐘。`],
        [`Correct the cause to supporting underprivileged children; add charity name and donation details.`, `把籌款目的改為支援基層兒童；加入慈善機構名稱及捐款資料。`]
      ]},
      { heading: 'Support', zhHeading: '支持', points: [
        [`Reassure Chloe and offer help with the craft stall and video.`, `安慰 Chloe，並主動協助手作攤位及剪輯影片。`]
      ]}
    ],
    expressions: [
      [`Thanks so much for all the effort…`, `非常感謝你付出的努力……`],
      [`Could we replace… with…?`, `我們可否把……改為……？`],
      [`Stay positive and keep up the fantastic work!`, `保持積極，繼續努力！`]
    ],
    model: {
      en: `A Few Ideas to Make Our Charity Bazaar Even Better!\n\nHey Chloe,\n\nThanks so much for all the effort you have put into organising the charity bazaar! I have a few suggestions to make it even more successful.\n\nCould we replace the second-hand clothes stall with a handmade crafts stall? Another club has already planned a clothes sale. We could also reduce the game booths from eight to five and place a donation box near the entrance.\n\nThe publicity video should be shortened from six minutes to two for social media. More importantly, it should focus on supporting underprivileged children instead of protecting endangered animals. Please include the charity's name and donation details at the end.\n\nThere is still plenty of time, and I am happy to help with the craft stall and video editing. Stay positive and keep up the fantastic work!\n\nCheers,\nJason`,
      zh: `幾個令慈善義賣會更出色的建議\n\nChloe：\n\n非常感謝你為籌辦慈善義賣會付出的努力！我有幾項建議，希望令活動更加成功。\n\n我們可否把二手衣物攤位改為手作攤位？另一個學會已計劃舉行衣物義賣，改用不同主題可令活動更有特色。我們亦可把遊戲攤位由八個減至五個，令管理更容易，並在入口附近設置捐款箱，鼓勵額外捐款。\n\n宣傳影片應由六分鐘縮短至兩分鐘，以吸引更多社交平台觀眾。更重要的是，宣傳內容應聚焦支援基層兒童，並修正現時保護瀕危動物的訊息。影片結尾別忘了加入慈善機構名稱及捐款資料。\n\n我們仍有充足時間，我也很樂意協助手作攤位及影片剪輯。保持積極，繼續努力！\n\nJason`
    }
  },
  {
    id: 'freshgo-response', number: '11', type: 'Press Release', zhType: '新聞稿',
    title: 'Response to Food Delivery Allegations', zhTitle: '回應外賣服務指控',
    situation: `You represent FreshGo Delivery. Write a formal press release responding to accusations about delivery efficiency, food safety and refunds, and restore public confidence.`,
    situationZh: `你代表 FreshGo Delivery。請撰寫正式新聞稿，回應有關送餐效率、食物安全及退款的指控，並重建公眾信心。`,
    requirements: [
      { heading: 'Facts', zhHeading: '事實', points: [
        [`Average delivery: 35 minutes; as little as 20 minutes off-peak.`, `平均送餐時間為 35 分鐘；非繁忙時段最快 20 分鐘。`],
        [`Independent inspections confirm hygiene standards; report online.`, `獨立檢查確認送餐袋符合衞生標準；報告已上載網站。`],
        [`Refund policy covers missing or incorrect items through the app.`, `退款政策涵蓋遺漏或錯誤食品，顧客可經應用程式申請。`]
      ]},
      { heading: 'Response', zhHeading: '公司回應', points: [
        [`Reassure customers, welcome genuine feedback and investigate difficulties.`, `安撫顧客、歡迎真誠意見，並調查退款困難。`],
        [`Reserve legal rights over deliberate falsehoods.`, `保留就蓄意散播失實資訊採取法律行動的權利。`]
      ]}
    ],
    expressions: [
      [`We wish to address recent allegations concerning…`, `我們現就近期有關……的指控作出回應。`],
      [`Contrary to claims that…`, `有關……的說法與事實不符……`],
      [`We remain open to legitimate feedback.`, `我們繼續歡迎真誠而合理的意見。`]
    ],
    model: {
      en: `Press Release: FreshGo Delivery Responds to Service and Food Safety Allegations\n\nFreshGo Delivery wishes to address recent allegations concerning delivery efficiency, food safety standards and refund arrangements. We take these concerns seriously and would like to clarify the facts.\n\nContrary to claims that deliveries regularly take more than two hours, our average delivery time is approximately 35 minutes, with orders arriving in as little as 20 minutes during off-peak hours.\n\nIndependent inspections confirm that all our delivery bags meet the required hygiene standards. The report is available on our official website. Our refund policy covers missing or incorrect food items, and customers may submit requests through our mobile application.\n\nFreshGo Delivery is dedicated to maintaining high service standards. We remain open to legitimate feedback and reserve the right to pursue legal action against those who deliberately spread demonstrably false information that damages our reputation.\n\nEND\nFreshGo Delivery`,
      zh: `新聞稿：FreshGo Delivery 回應服務及食物安全指控\n\nFreshGo Delivery 現就近期有關送餐效率、食物安全標準及退款安排的指控作出回應。我們認真看待上述關注，並希望澄清事實。\n\n有關送餐經常需時兩小時以上的說法與事實不符。本公司平均送餐時間約為 35 分鐘，非繁忙時段最快可於 20 分鐘內送達。\n\n獨立食物安全機構的檢查確認，本公司所有送餐袋均符合所需衞生標準，相關報告已上載官方網站。本公司的退款政策涵蓋遺漏或錯誤食品，顧客可透過流動應用程式提交申請。\n\nFreshGo Delivery 致力維持高水平服務。我們繼續歡迎真誠而合理的意見，並保留權利，對蓄意散播可證實為失實而且損害本公司聲譽的資訊者採取法律行動。\n\n完\nFreshGo Delivery`
    }
  },
  {
    id: 'meals-of-hope', number: '12', type: 'Speech', zhType: '演講辭',
    title: 'Celebrating Meals of Hope', zhTitle: '慶祝「希望膳食」計劃成果',
    situation: `You co-founded FoodBridge Foundation. Address volunteers, donors and partners at a celebration of the Meals of Hope food rescue programme.`,
    situationZh: `你是 FoodBridge Foundation 的共同創辦人。請在「希望膳食」食物救援計劃慶祝活動上，向義工、捐款者及社區伙伴發表演講。`,
    requirements: [
      { heading: 'Journey', zhHeading: '發展歷程', points: [
        [`Thank businesses, volunteers and coordinator Rachel Lam.`, `感謝商戶、義工及統籌 Rachel Lam。`],
        [`Started community service at 16; met Daniel Wong at university; founded FoodBridge eight years later.`, `16 歲開始參與社區服務；大學認識 Daniel Wong；八年後共同創立 FoodBridge。`]
      ]},
      { heading: 'Growth', zhHeading: '計劃成長', points: [
        [`From three restaurants and 100 meals weekly to 40 partners and 3,000 meals.`, `由三間餐廳及每週 100 份膳食，增至 40 個伙伴及每週 3,000 份膳食。`]
      ]},
      { heading: 'Future', zhHeading: '未來', points: [
        [`Five community kitchens, 5,000 meals and 60 jobs next year.`, `明年設立五間社區廚房，提供 5,000 份膳食及 60 個職位。`]
      ]}
    ],
    expressions: [
      [`Tonight, as we celebrate…`, `今晚，在我們慶祝……之際……`],
      [`What began with just… has grown into…`, `由最初僅有……，發展成今天的……`],
      [`Together, we have transformed surplus food into hope.`, `我們攜手把剩餘食物轉化成希望。`]
    ],
    model: {
      en: `From Food Waste to Hope: Celebrating Our Journey\n\nGood evening, distinguished guests, volunteers and community partners,\n\nAs we celebrate Meals of Hope, I thank local businesses for their donations, our volunteers for their dedication and coordinator Rachel Lam for her invaluable contribution.\n\nMy journey began at 16, when I discovered community service. At Hong Kong Metropolitan University, I met co-founder Daniel Wong. After studying social work and working at a welfare centre, Daniel and I founded FoodBridge Foundation eight years later.\n\nSix years ago, Rachel and I created a programme to collect surplus food for families in need. What began with three restaurants providing about 100 meals a week has grown into 40 restaurants and supermarkets distributing more than 3,000 meals weekly.\n\nNext year, we will establish five community kitchens with GreenHarvest Agricultural Association. They will provide over 5,000 nutritious meals each week and create 60 jobs for disadvantaged residents. Our mission remains clear: no one should go hungry while edible food is wasted.\n\nTogether, we have transformed surplus food into hope and compassion into action. Thank you!`,
      zh: `從廚餘到希望：慶祝我們的共同旅程\n\n各位嘉賓、義工及社區伙伴，晚上好：\n\n在我們慶祝「希望膳食」計劃成果之際，我衷心感謝本地商戶慷慨捐贈食物、義工全情投入，以及計劃統籌 Rachel Lam 作出的寶貴貢獻。\n\n我的旅程始於 16 歲，當時我發現自己對社區服務的熱情。在香港都會大學修讀社會工作期間，我認識了共同創辦人 Daniel Wong。其後我在社區福利中心工作，八年後與 Daniel 一同創立 FoodBridge Foundation。\n\n六年前，Rachel 與我構思一項收集剩餘食物並送予有需要家庭的計劃。計劃最初只與三間餐廳合作，每週提供約 100 份膳食；今天已發展成由 40 間餐廳及超級市場組成的網絡，每週派發超過 3,000 份膳食。\n\n明年，我們會與 GreenHarvest Agricultural Association 合作，在全港設立五間社區廚房。這些廚房每週將提供超過 5,000 份營養膳食，並為基層居民創造 60 個就業機會。我們的使命依然清晰：只要仍有可食用的食物被浪費，香港便不應有人捱餓。\n\n我們攜手把剩餘食物轉化成希望，把關懷化為行動。謝謝大家！`
    }
  },
  {
    id: 'electronic-waste', number: '13', type: 'Informative Article', zhType: '資料文章',
    title: 'The Growing Problem of Electronic Waste', zhTitle: '日益嚴重的電子廢物問題',
    situation: `You write for a Greenhaven newspaper. Explain the scale and impact of electronic waste, proposed recycling rules and new waste-management technology.`,
    situationZh: `你是 Greenhaven 本地報章撰稿員。請說明電子廢物的規模及影響、建議中的回收規例，以及廢物管理科技的發展。`,
    requirements: [
      { heading: 'Scale and impact', zhHeading: '規模及影響', points: [
        [`12,000 tonnes yearly; over $80 million damage; 6,000 devices at illegal sites in 2022.`, `每年 12,000 公噸；環境損失超過 8,000 萬元；2022 年非法棄置點發現 6,000 件裝置。`],
        [`Hazardous substances contaminate soil and water.`, `有害物質可污染泥土及水源。`]
      ]},
      { heading: 'Regulation', zhHeading: '規例', points: [
        [`Green Earth Alliance proposed compulsory retailer recycling; broad survey and councillor support.`, `Green Earth Alliance 建議零售商強制回收；調查及區議員均廣泛支持。`]
      ]},
      { heading: 'Technology', zhHeading: '科技', points: [
        [`Automated sorting, metal recovery and smart bins may raise recovery by up to 60%.`, `自動分類、金屬回收及智能回收箱可把物料回收率提高最多 60%。`]
      ]}
    ],
    expressions: [
      [`In 2022 alone…`, `單在 2022 年……`],
      [`According to its survey…`, `根據該機構的調查……`],
      [`Research suggests that…, although…`, `研究顯示……，但……`]
    ],
    model: {
      en: `Electronic Waste in Greenhaven: A Growing Threat and Possible Solutions\n\nGreenhaven generates over 12,000 tonnes of electronic waste annually, with environmental damage from improper disposal costing more than $80 million. In 2022 alone, about 6,000 discarded devices were found at illegal dumping sites. Hazardous substances can also contaminate soil and water.\n\nIn 2023, Green Earth Alliance proposed compulsory recycling requirements for electronic retailers. Its survey found that 35% strongly supported the proposal, more than 40% supported it and only 8% opposed it. Eighteen district councillors also backed the proposal.\n\nAutomated sorting machines, metal recovery systems and smart recycling bins can improve processing and resource recovery. Research suggests that these technologies could increase recovery rates by up to 60%, although effectiveness varies with the waste processed. The market for electronic-waste recycling technology grew by 45% between 2023 and 2024.`,
      zh: `Greenhaven 的電子廢物：日益嚴重的威脅與可行方案\n\nGreenhaven 每年產生超過 12,000 公噸電子廢物，處理不當造成的環境損失超過 8,000 萬元。單在 2022 年，非法棄置點便發現約 6,000 件廢棄電子裝置。電子廢物中的有害物質亦可污染泥土及水源。\n\n2023 年，本地非政府機構 Green Earth Alliance 建議規定電子產品零售商強制回收。調查顯示，35% 受訪者非常支持建議，超過 40% 表示支持，只有 8% 反對。建議亦獲 18 名區議員支持。\n\n自動分類機、先進金屬回收系統及智能回收箱可改善廢物處理及資源回收。研究顯示，這些科技可把物料回收率提高最多 60%，但實際成效會因處理的廢物種類而異。2023 至 2024 年間，電子廢物回收科技市場增長了 45%。`
    }
  }
];
