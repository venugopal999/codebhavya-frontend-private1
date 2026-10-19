"use strict";
const wtPremiumTraceStages = {
  "url": [
    [
      "🔒",
      "Protocol",
      "Choose the communication protocol",
      "https:// identifies HTTPS, which protects communication in transit when correctly configured.",
      "https://",
      "The protocol describes how the browser communicates. It is not the website name."
    ],
    [
      "🌐",
      "Domain",
      "Identify the website",
      "codebhavya.com is the domain name in this example.",
      "codebhavya.com",
      "The browser resolves the domain name to reach the requested host. A domain is separate from a resource path."
    ],
    [
      "📂",
      "Path",
      "Locate the resource",
      "The path identifies the requested resource within the website.",
      "/Web-Technologies/html-fundamentals.html",
      "The site or server decides how to map this path to a resource. A path need not correspond to a physical file."
    ],
    [
      "🔎",
      "Query",
      "Provide query parameters",
      "?mode=learn supplies a query parameter named mode with the value learn.",
      "?mode=learn",
      "The query is part of the request target. Websites decide how to interpret it; avoid placing sensitive information in URLs."
    ],
    [
      "📍",
      "Fragment",
      "Locate a part of the resource",
      "#html identifies a location or state within the current resource.",
      "#html",
      "The fragment is not sent as part of the HTTP request target. For an HTML anchor, the browser looks for a matching element ID."
    ]
  ],
  "form": [
    [
      "⌨️",
      "Enter",
      "Enter or choose control values",
      "The learner enters a fictional name and selects the workshop options. Nothing has been sent.",
      "student = Asha; topic = html; seats = 1",
      "The form stores current control values in the page. This visualizer explains a fixed example; the next lab lets you inspect your own changes."
    ],
    [
      "✅",
      "Validate",
      "Check applicable constraints",
      "The browser checks requirements such as required fields, email syntax and numeric limits.",
      "required · type=\"email\" · min=\"1\" · max=\"4\"",
      "Invalid controls can block normal submission. Browser checks help the learner; server validation is independently required."
    ],
    [
      "🏷️",
      "Collect",
      "Collect eligible name/value pairs",
      "Enabled named controls contribute values. Unchecked checkboxes and radios are omitted.",
      "student=Asha&topic=html&seats=1&mode=online&course=html",
      "name supplies the submitted key; id identifies the control in the document. A supported readonly control can contribute a value, while a disabled control is omitted."
    ],
    [
      "📦",
      "Represent",
      "Prepare the request representation",
      "The method and encoding determine how the form data is represented.",
      "GET: /workshop-register?student=Asha\nPOST body: student=Asha",
      "These are abbreviated illustrations. GET commonly uses query data; POST commonly uses body data. POST does not replace HTTPS or server validation."
    ],
    [
      "🛡️",
      "Process",
      "Validate and process on the server",
      "A real server independently checks the request, authorization and data before processing it.",
      "Server: validate → authorize → process → respond",
      "This journey stops at a conceptual server stage. No request is made by the visualizer or the form inspection lab."
    ]
  ],
  "semantic": [
    [
      "🗺️",
      "Regions",
      "Identify the major page regions",
      "Locate the page-level header, named navigation, main content and footer.",
      "header · nav · main · footer",
      "This is a reading map, not a CSS layout. Nested article headers have a different scope from the page header."
    ],
    [
      "🔠",
      "Headings",
      "Read the heading hierarchy",
      "The page topic uses h1; Preparation and Learning task use h2.",
      "h1 Workshop\n  h2 Preparation\n  h2 Learning task",
      "Headings expose topic relationships. A large paragraph or an automatically styled section does not create the right heading rank."
    ],
    [
      "⌨️",
      "Keyboard",
      "Follow focus and activate controls",
      "Use Tab and Shift+Tab to reach links and the native disclosure summary.",
      "Tab → skip link → navigation link → summary",
      "Native controls provide familiar keyboard behavior. Preserve visible focus and avoid positive tabindex values."
    ],
    [
      "🏷️",
      "Names",
      "Check names and relationships",
      "The navigation is named Workshop and the disclosure says Show task hint.",
      "nav: Workshop\nsummary: Show task hint",
      "Names should help the learner understand the control or region. For inputs, use a visible label and associate help text when useful."
    ],
    [
      "🔎",
      "Verify",
      "Combine checks and record findings",
      "Inspect the actual structure, test the keyboard path and review text alternatives.",
      "Structure + keyboard + names + manual review",
      "These checks can reveal problems, but a passing teaching checklist does not certify full accessibility. Test the whole user task and relevant assistive technology."
    ]
  ],
  "css": [
    [
      "🎯",
      "Match",
      "Match rules to the element",
      "The paragraph has id=\"lesson-note\" and class=\"note\", so both the ID and class rules match.",
      "<p id=\"lesson-note\" class=\"note\">Workshop notice</p>",
      "Before comparing priorities, check the selector and confirm that the stylesheet loaded. A non-matching rule cannot style this paragraph."
    ],
    [
      "⚖️",
      "Context",
      "Check importance and cascade context",
      "This example uses normal author declarations in the same layer, with no animations or scoped rules.",
      "#lesson-note { color: #663399; }\n.note { color: #075a83; }",
      "Importance and cascade context are considered before specificity. Here those earlier decisions are equal, so compare the matching selectors."
    ],
    [
      "🔢",
      "Specificity",
      "Compare the matching selectors",
      "The ID selector has greater specificity than the class selector.",
      "#lesson-note → ID component\n.note → class component",
      "The later class rule does not win merely because it appears last. The matching normal ID declaration wins this conflict."
    ],
    [
      "📄",
      "Order",
      "Use order only for a remaining tie",
      "If we instead had two matching .note rules in this same context, later source order would break their tie.",
      ".note { color: #075a83; }\n.note { color: #663399; }",
      "This stage shows a separate equal-specificity example. It illustrates the tie-breaker rather than changing the result of the preceding ID-versus-class example."
    ],
    [
      "🎨",
      "Result",
      "Render the selected text color",
      "In the original ID-versus-class example, the paragraph uses the requested purple color.",
      "Selected color: #663399",
      "The browser combines the winning values for individual properties with defaults and inheritance. This teaching trace explains fixed examples, not an arbitrary CSS engine."
    ]
  ],
  "box": [
    [
      "📝",
      "Content",
      "Start with the content width",
      "This content-box example begins with a definite 200px content width.",
      "Content width = 200px",
      "The demonstration uses symmetric pixel values with no layout shrinking or min/max constraints."
    ],
    [
      "🛋️",
      "Padding",
      "Add inside spacing",
      "Padding adds 20px to each horizontal side of the content.",
      "200 + 20 + 20 = 240px",
      "Padding belongs inside the border. In content-box mode it increases the border-box width beyond the stated content width."
    ],
    [
      "🧱",
      "Border",
      "Add the boundary",
      "A 4px border on each side brings the border-box width to 248px.",
      "240 + 4 + 4 = 248px",
      "The border width is part of the box dimensions. An outline has a different layout role."
    ],
    [
      "↔️",
      "Margin",
      "Account for outside spacing",
      "A 10px margin on each horizontal side gives 268px for this box plus its margins.",
      "248 + 10 + 10 = 268px",
      "Margin is outside the border box. This horizontal example is separate from vertical margin collapsing."
    ],
    [
      "📐",
      "Compare",
      "Switch the meaning of width",
      "With border-box and declared width 200px, the border box is 200px and the content is 152px here.",
      "Content: 200 - 40 - 8 = 152px\nWith margins: 200 + 20 = 220px",
      "Border-box includes padding and border in the declared width, but still excludes margin. Use the lab to compare other safe values."
    ]
  ],
  "responsive": [
    [
      "📄",
      "Source",
      "Begin with a meaningful source order",
      "Six resource cards appear in document order 1 through 6.",
      "HTML order: 1 → 2 → 3 → 4 → 5 → 6",
      "A useful reading and keyboard sequence is the foundation. Layout must not be used to repair an illogical source order."
    ],
    [
      "🗂️",
      "Tracks",
      "Choose the collection layout",
      "The responsive example uses Grid with a one-column narrow default.",
      ".cards { display: grid; grid-template-columns: 1fr; }",
      "Grid keeps shared column tracks across rows. Flexbox would distribute each wrapped line independently."
    ],
    [
      "📱",
      "Narrow",
      "Render at the narrow teaching viewport",
      "At 240px, neither wider minimum-width rule matches, so the six cards use one column.",
      "240px viewport → 1 column → 6 rows",
      "The text must remain readable and the preview can scroll vertically. The viewport values are examples, not labels for all phones."
    ],
    [
      "📐",
      "Wider",
      "Match the wider conditions",
      "At 420px the two-column rule matches. At 640px the later three-column rule also matches.",
      "420px → 2 columns\n640px → 3 columns",
      "Media conditions and cascade order cooperate. At 640px, the later applicable rule sets three columns in this controlled example."
    ],
    [
      "⌨️",
      "Review",
      "Verify use, not just appearance",
      "Check disclosure focus order, long-token wrapping and readable content at each preview width.",
      "Layout + content growth + focus + source order",
      "The visualizer explains fixed stages. It is not an arbitrary layout engine or a full accessibility certification."
    ]
  ],
  "javascript": [
    [
      "🔤",
      "Read",
      "Begin with text input",
      "The fixed teaching values are the strings \"30\" and \"12\".",
      "capacityText = \"30\"\nreservedText = \"12\"",
      "Input.value provides text. Similar-looking text and numbers can behave differently."
    ],
    [
      "🔎",
      "Check",
      "Validate the intended format",
      "Both strings contain decimal digits and meet the 0–1000 teaching range.",
      "/^\\d+$/.test(text.trim()) → true",
      "Blank text is rejected before conversion. A converted value still needs range and relationship checks."
    ],
    [
      "🔄",
      "Convert",
      "Create Number values",
      "Number conversion supplies capacity 30 and reserved 12.",
      "Number(\"30\") → 30\nNumber(\"12\") → 12",
      "These are now numbers. Conversion is explicit and does not replace validation."
    ],
    [
      "🧮",
      "Calculate",
      "Subtract reserved from capacity",
      "The fixed example has 18 remaining seats.",
      "30 - 12 → 18\ntypeof 18 → \"number\"",
      "Check reserved <= capacity before treating the result as an available-seat count."
    ],
    [
      "💬",
      "Report",
      "Select a useful message",
      "The remaining value is greater than zero, so report available seats.",
      "remaining === 0 → false\n\"18 seats available\"",
      "This trace explains one fixed example. The lab handles other supplied values under its stated rules."
    ]
  ],
  "collections": [
    [
      "📚",
      "Source",
      "Start with four workshop records",
      "The fixed catalog contains HTML, CSS, JavaScript and Accessibility.",
      "capacity / reserved: 30/12, 20/20, 40/10, 12/0",
      "The predefined records meet the data contract. Preserve their original values and source order."
    ],
    [
      "🔄",
      "Derive",
      "Create a remaining field with map",
      "New flat record objects contain remaining counts 18, 0, 30 and 12.",
      "workshops.map(w => ({ ...w, remaining: w.capacity - w.reserved }))",
      "Map returns a new outer array. This callback also creates new top-level record objects."
    ],
    [
      "🧲",
      "Select",
      "Filter for available places",
      "CSS has zero remaining seats and is excluded from the available selection.",
      "HTML 18 · JavaScript 30 · Accessibility 12",
      "Filter returns a new selection array. It does not itself clone the selected records."
    ],
    [
      "↕️",
      "Order",
      "Sort a copied selection",
      "Order by most remaining seats, using stable IDs for ties.",
      "JavaScript 30 → HTML 18 → Accessibility 12",
      "The result array is copied before sort. Source record order is preserved."
    ],
    [
      "🧮",
      "Summarize",
      "Report the selected collection",
      "Three selected workshops have 60 remaining seats in total.",
      "reduce((total, w) => total + w.remaining, 0) → 60",
      "An initial zero supports the empty case. The trace illustrates one fixed scenario; the lab supports other selections."
    ]
  ],
  "dom": [
    [
      "🔎",
      "Select",
      "Find the intended preview region",
      "Use a fixed ID and check that the preview exists.",
      "document.getElementById(\"preview\")",
      "A null result must be handled. The operation stays scoped to the preview, not the global page shell."
    ],
    [
      "🛠️",
      "Create",
      "Create disconnected nodes",
      "Build a list item, article, title, note and badge.",
      "document.createElement(\"article\")",
      "Creating an element does not insert it. Assemble the useful semantic structure before appending."
    ],
    [
      "🔤",
      "Populate",
      "Supply literal text and identity",
      "Set a generated data-card-id and use textContent for the title and note.",
      "title.textContent = \"HTML Workshop\"",
      "User text is not parsed as markup. Stable identity is separate from the displayed title."
    ],
    [
      "📦",
      "Insert",
      "Append to the preview list",
      "The assembled list item becomes connected to the document.",
      "preview.append(item)",
      "Insertion changes the live tree. It does not rewrite the source HTML file or save to GitHub."
    ],
    [
      "🔎",
      "Inspect",
      "Read the current result and report",
      "Query the updated preview and announce the card count.",
      "preview.querySelectorAll(\".wt16-card\").length",
      "A fresh query sees new nodes. Inspect the browser rendering and keyboard behavior separately."
    ]
  ],
  "events": [
    [
      "🖱️",
      "Activate",
      "Activate the native submit control",
      "The form workflow reaches its submit listener in the local novalidate demo.",
      "form.addEventListener(\"submit\", handler)",
      "A native form workflow is broader than one button click. This lab deliberately uses inline validation."
    ],
    [
      "🛑",
      "Cancel",
      "Keep the demo on the page",
      "Prevent the default submission before doing local processing.",
      "event.preventDefault()",
      "Default cancellation and propagation control are separate. No network submission is performed."
    ],
    [
      "✅",
      "Validate",
      "Check field and session rules",
      "Require a name, syntactically valid email, known session, allowed places and confirmation.",
      "requested <= session.available",
      "Clear stale custom validity before the next check. Errors focus the first invalid field."
    ],
    [
      "📦",
      "Collect",
      "Collect named controls",
      "FormData yields string entries; an optional unchecked checkbox is omitted.",
      "new FormData(form)",
      "Convert the places entry deliberately for the normalized local preview."
    ],
    [
      "💬",
      "Report",
      "Show the accepted local preview",
      "Report the result while leaving the form available for another attempt.",
      "status.textContent = \"Local preview accepted.\"",
      "The teaching preview is local to this page visit. It does not reserve real workshop seats."
    ]
  ],
  "async": [
    [
      "⏳",
      "Start",
      "Start and own a catalog request",
      "Assign a request ID and show loading while the promise is pending.",
      "requestId = ++latestRequestId",
      "Only this request may write the current result while it remains the latest owner."
    ],
    [
      "📨",
      "Status",
      "Inspect the received response",
      "A response object arrives; check its HTTP status before parsing.",
      "if (!response.ok) throw new Error(`HTTP ${response.status}`)",
      "HTTP 404 can fulfill fetch with a Response. Transport failure and HTTP failure are separate stages."
    ],
    [
      "🔤",
      "Parse",
      "Read the body as JSON",
      "Await the asynchronous body parse.",
      "const data = await response.json()",
      "A malformed JSON body can reject here even after a successful HTTP status."
    ],
    [
      "✅",
      "Validate",
      "Check the workshop contract",
      "Accept unique IDs, meaningful titles and valid capacity/reserved counts.",
      "remaining = capacity - reserved",
      "Parsing is not validation. Reject an unacceptable record before creating cards."
    ],
    [
      "💬",
      "Render",
      "Report the owned outcome",
      "If still the newest request, render accepted records and clear its busy state.",
      "if (requestId === latestRequestId) showCatalog(data)",
      "Empty, error and canceled outcomes also need clear messages and ownership guards."
    ]
  ],
  "storage": [
    [
      "✍️",
      "Edit",
      "Prepare a study preference",
      "The editor holds a draft; nothing has been saved yet.",
      "{ version: 1, topic: \"html\", minutes: 15, note: \"Review forms\" }",
      "Changing fields does not write storage. Select the area and explicitly press Save."
    ],
    [
      "✅",
      "Validate",
      "Check the preference contract",
      "Accept the supported version, topic, numeric duration and bounded note.",
      "const accepted = validatePreference(draft)",
      "Validation comes before the write. An unacceptable draft leaves the saved value untouched."
    ],
    [
      "💾",
      "Save",
      "Serialize and attempt the write",
      "Write a JSON string under this feature’s one key.",
      "store.setItem(key, JSON.stringify(accepted))",
      "The normal trace assumes this write succeeds. Denied access and quota failure need a truthful error outcome."
    ],
    [
      "📖",
      "Read",
      "Read and parse the saved text",
      "Distinguish an absent key from present text, then parse bounded JSON.",
      "const raw = store.getItem(key)",
      "A missing key is not a corrupt record. JSON parsing can fail even when the key exists."
    ],
    [
      "🔄",
      "Restore",
      "Validate before restoring the editor",
      "Check the loaded version and fields before replacing the draft.",
      "const restored = validatePreference(JSON.parse(raw))",
      "Only accepted data reaches the editor. A load failure preserves unsaved work."
    ]
  ],
  "server": [
    [
      "📨",
      "Request",
      "Receive the booking request",
      "A client requests one HTML place using the agreed JSON contract.",
      "POST /bookings {\"workshopId\":\"html\",\"seats\":1}",
      "This is a local teaching trace. A deployed backend would receive an actual HTTP request."
    ],
    [
      "🧭",
      "Route",
      "Select the allowed handler",
      "Match the known path and supported POST method.",
      "route = bookingCreateHandler",
      "An unknown path or unsupported method stops before the booking handler mutates data."
    ],
    [
      "🪪",
      "Identify",
      "Recognize the caller",
      "Look up a credential and use the trusted identity for ownership.",
      "ownerId = recognizedUser.id",
      "A client-provided role or userId does not grant permission or choose the booking owner."
    ],
    [
      "✅",
      "Check",
      "Validate input and capacity",
      "Parse JSON, check exact fields and compare seats with current availability.",
      "seats <= workshop.remaining",
      "Valid syntax is not enough. Types, bounds, permissions and business rules are separate checks."
    ],
    [
      "📤",
      "Commit",
      "Create the booking and respond",
      "Commit one mock booking and return a deliberate 201 response.",
      "remaining -= seats; return response(201, booking)",
      "Only an accepted commit changes this local state. A real database requires a suitable transaction and concurrency strategy."
    ]
  ],
  "php": [
    [
      "📨",
      "Receive",
      "Receive decoded form strings",
      "An ordinary URL-encoded POST supplies scalar strings.",
      "$_POST = [\"learner\" => \"Ada\", \"course\" => \"html\", \"days\" => \"2\"]",
      "PHP form input is external data. Check method, media type, exact fields and scalar types."
    ],
    [
      "✅",
      "Validate",
      "Accept the documented representations",
      "Trim the learner label, check its bound and validate course plus days spelling.",
      "preg_match(\"/\\A[1-5]\\z/\", $post[\"days\"])",
      "The string \"02\" is not accepted here, even if a cast could produce the integer 2."
    ],
    [
      "🔢",
      "Convert",
      "Normalize accepted values",
      "Convert only the validated duration and choose the trusted course price.",
      "$days = (int) $post[\"days\"]",
      "An accepted string becomes a number after validation. The client does not supply the price."
    ],
    [
      "🧮",
      "Calculate",
      "Calculate the fictional study quote",
      "Multiply integer paise and format the bounded total.",
      "$totalPaise = 12550 * 2; // 25100",
      "The display is INR 251.00. This quote performs no payment, booking or persistent write."
    ],
    [
      "📤",
      "Escape",
      "Return escaped HTML text",
      "Encode the label for HTML text and send the response.",
      "htmlspecialchars($learner, ENT_QUOTES | ENT_SUBSTITUTE, \"UTF-8\")",
      "A label containing markup characters stays visible text. The browser lab demonstrates this fixed flow in JavaScript."
    ]
  ],
  "javaweb": [
    [
      "🧰",
      "Map",
      "Map a catalog request",
      "A compatible container selects the application and servlet mapping.",
      "GET /catalog?category=backend&available=true&limit=3&view=jsp",
      "The browser lab models one public route; a real container manages the actual request and component lifecycle."
    ],
    [
      "🧭",
      "Validate",
      "Validate controller parameters",
      "Accept four unique scalar values and normalize the limit plus boolean.",
      "category = backend; availableOnly = true; limit = 3",
      "Invalid or duplicate-shaped parameters stop before service and repository access."
    ],
    [
      "🧩",
      "Service",
      "Coordinate the catalog operation",
      "A service asks the repository for records and applies the catalog contract.",
      "catalogService.findCourses(filters)",
      "Business coordination stays separate from request objects, JDBC details and page markup."
    ],
    [
      "🗃️",
      "Repository",
      "Read the course records",
      "The repository returns controlled data or a deliberate failure.",
      "courseRepository.findAll()",
      "This lab uses fixed local records, not JDBC. A real repository requires a configured data source and resource handling."
    ],
    [
      "📤",
      "View",
      "Render the accepted model",
      "Filter before limiting, attach a request model and choose HTML or JSON.",
      "request.setAttribute(\"catalog\", acceptedCourses)",
      "A JSP branch forwards internally; a JSON branch serializes the model. Only accepted data is rendered."
    ]
  ],
  "servlets": [
    [
      "🗺️",
      "Map",
      "Find the mapped servlet",
      "The application-relative path selects the component.",
      "POST /study",
      "Unknown paths stop at routing. This player follows an accepted POST for one mock client."
    ],
    [
      "⚙️",
      "Init",
      "Prepare the servlet instance",
      "Initialize before its first service call.",
      "init() → ready",
      "The same instance handles later requests without repeating initialization."
    ],
    [
      "📨",
      "Validate",
      "Dispatch and validate the request",
      "The POST handler checks media type, shape and every value.",
      "doPost: learner + allowed topic",
      "No session is created or changed until the whole submission is accepted."
    ],
    [
      "👤",
      "Session",
      "Associate the accepted preference",
      "Obtain or create the current client’s modeled session.",
      "getSession(); setAttribute(\"studyPreference\", accepted)",
      "The other mock client has a separate association; this model is not authentication."
    ],
    [
      "📤",
      "Respond",
      "Return a deliberate response",
      "Serialize the accepted result and display literal text.",
      "200 · application/json; charset=UTF-8",
      "The browser lab models this flow locally without Java, HTTP or cookies."
    ]
  ],
  "jsp": [
    [
      "📨",
      "Request",
      "Accept the report request",
      "Validate the incoming learner before preparing data.",
      "GET /report?learner=Demo",
      "The controller handles input; the JSP view is not a substitute for validation."
    ],
    [
      "🧩",
      "Model",
      "Prepare an accepted report",
      "Bound and check learner, course titles and completion flags.",
      "request.setAttribute(\"lessonReport\", acceptedReport)",
      "Derive counts from accepted rows, not client-supplied summary values."
    ],
    [
      "↪️",
      "Forward",
      "Dispatch the same request",
      "Forward internally to the protected view before output commitment.",
      "/WEB-INF/views/study-report.jsp",
      "The request model remains available. A redirect would make a different request."
    ],
    [
      "📄",
      "View",
      "Render explicit model values",
      "Use request-scope lookup, branches, loops and encoded HTML text.",
      "c:choose + c:forEach + c:out",
      "JSP translation and tag execution happen in a real server; this player only explains the stages."
    ],
    [
      "📤",
      "HTML",
      "Return the generated content",
      "Send HTML; the browser displays the result.",
      "200 · text/html; charset=UTF-8",
      "The lab models fixed rendering locally and builds its safe preview from text nodes."
    ]
  ],
  "jdbc": [
    [
      "📨",
      "Validate",
      "Accept the transfer operation",
      "Validate distinct learner IDs and a bounded canonical integer amount.",
      "A → B · amount 3",
      "Rejected input stops before connection acquisition."
    ],
    [
      "🔌",
      "Connect",
      "Acquire an owned connection",
      "Begin a deliberate manual transaction on one connection.",
      "getConnection(); setAutoCommit(false)",
      "The local lab uses a working snapshot rather than an actual database session."
    ],
    [
      "➖",
      "Debit",
      "Execute the conditional debit",
      "Bind subtraction amount, source ID and minimum tokens; require one affected row.",
      "UPDATE ... tokens = tokens - ? ... tokens >= ?",
      "A zero debit stops before the credit. Values remain separate from SQL structure."
    ],
    [
      "➕",
      "Credit",
      "Execute the paired credit",
      "Bind amount and destination; require one affected row.",
      "UPDATE ... tokens = tokens + ? WHERE learner_id = ?",
      "A known failure before commit rolls back the staged debit in manual mode."
    ],
    [
      "✅",
      "Resolve",
      "Commit and close owned resources",
      "Publish both accepted updates and finish the operation.",
      "commit(); close statements; close connection",
      "This accepted path preserves the operation’s token total. Real JDBC cleanup needs separate integration checks."
    ]
  ],
  "sql": [
    [
      "🧩",
      "Model",
      "Identify related facts",
      "Separate learners, courses and their enrollment pairs.",
      "learners + courses + enrollments",
      "Keys and references preserve the intended relationships."
    ],
    [
      "🔗",
      "Join",
      "Match qualifying enrollments",
      "Left join with completed status in the ON condition.",
      "LEFT JOIN ... ON ... AND e.status = ?",
      "Courses without completed enrollments retain null-extended rows."
    ],
    [
      "🔢",
      "Group",
      "Count actual relationships",
      "Group by course and count non-null enrollment identifiers.",
      "COUNT(e.learner_id); AVG(e.grade)",
      "Unmatched count is zero; average is NULL when no grade exists."
    ],
    [
      "🎯",
      "Retain",
      "Filter, sort and limit groups",
      "Apply the accepted group threshold, then stable course-ID ordering.",
      "HAVING COUNT(...) >= ? ORDER BY c.course_id LIMIT ?",
      "Do not limit the raw courses before the report has selected its groups."
    ],
    [
      "📤",
      "Report",
      "Return a bounded report",
      "Expose controlled rows and clear empty/missing-grade text.",
      "HTML 2 / 80; JSP 0 / NULL; SQL 0 / NULL",
      "The lab models this locally. Fixed query results are also checked separately in SQLite."
    ]
  ],
  "rest": [
    [
      "🗺️",
      "Route",
      "Identify the resource operation",
      "POST to the task collection requests creation.",
      "POST /api/tasks",
      "A collection write differs from item read/replacement/deletion."
    ],
    [
      "🧩",
      "Validate",
      "Accept the JSON representation",
      "Check media type, parse bounded JSON and validate exact fields.",
      "title: bounded text; completed: boolean",
      "Reject before allocating an ID or changing state."
    ],
    [
      "💾",
      "Apply",
      "Create accepted task state",
      "Choose the next public mock ID within collection limits.",
      "new task id 3",
      "This local model has no database, account or network operation."
    ],
    [
      "📤",
      "Respond",
      "Return a creation outcome",
      "Include the created representation and its resource path.",
      "201 · Location: /api/tasks/3",
      "Headers and body describe the accepted result; errors use their own outcomes."
    ],
    [
      "🪟",
      "Present",
      "Handle the representation safely",
      "The client verifies status/body and renders task titles literally.",
      "JSON task → fixed DOM text nodes",
      "A204 deletion would follow a different client branch with no body parsing."
    ]
  ],
  "security": [
    [
      "🔑",
      "Session",
      "Resolve trusted session identity",
      "An active server-side session identifies user A.",
      "session → user A",
      "A request body cannot choose its own trusted identity."
    ],
    [
      "🛡️",
      "Ownership",
      "Authorize the specific note",
      "User A may change note1, which belongs to A.",
      "note.owner === session.user",
      "Apply object authorization to each read and write."
    ],
    [
      "🎟️",
      "CSRF",
      "Check the protected write",
      "Require expected origin and the current session token.",
      "origin + session-bound token",
      "SameSite is an additional layer; XSS can undermine CSRF defenses."
    ],
    [
      "🧩",
      "Validate",
      "Accept only writable text",
      "Reject extra keys, invalid syntax and unbounded text.",
      "exactly {text: bounded string}",
      "Validation cannot replace authorization or output handling."
    ],
    [
      "🪟",
      "Present",
      "Apply and show safe text",
      "Update the owned note after all gates pass.",
      "fixed node.textContent = note.text",
      "This teaching model does not implement real authentication or cookies."
    ]
  ],
  "performance": [
    [
      "📦",
      "Release",
      "Publish an identified release",
      "The origin now holds release2 at the stable teaching URL.",
      "origin v2; browser cached v1",
      "Publishing does not directly delete an already fresh browser entry."
    ],
    [
      "⏳",
      "Age",
      "Check the stored freshness lifetime",
      "At age60 and max-age60, the cached representation is stale.",
      "age < max-age → fresh",
      "This local clock omits Date/Age transit calculations and reload directives."
    ],
    [
      "🔎",
      "Validate",
      "Send the stored validator",
      "An expired entry asks whether its stored version still matches.",
      "If-None-Match: \"release-1\"",
      "A changed version needs a full response; an unchanged one can return304."
    ],
    [
      "📤",
      "Transfer",
      "Deliver the changed representation",
      "The toy origin returns release2 and its current metadata.",
      "200 + representation; store new entry",
      "A304 has no body and refreshes the stored entry metadata in this model."
    ],
    [
      "🪟",
      "Present",
      "Render the accepted release",
      "The page shows the new text and records body bytes.",
      "fixed node.textContent = release.text",
      "Estimated bytes are fixture values; measure actual field performance separately."
    ]
  ],
  "capstone": [
    [
      "🎯",
      "Scope",
      "Describe one useful user journey",
      "Choose a study-task tracker with bounded read and create actions.",
      "user → task list → create task",
      "A small complete feature is easier to verify than many unfinished screens."
    ],
    [
      "🧱",
      "Contract",
      "Assign responsibilities",
      "Browser presents data; a backend enforces shared/private operations.",
      "UI ↔ application contract ↔ owned data",
      "A static interface cannot itself enforce multi-user private ownership."
    ],
    [
      "🛠️",
      "Build",
      "Implement the smallest complete slice",
      "Connect validation, state change and explicit success/error outcomes.",
      "valid input → accepted change → safe display",
      "Explain decisions and retain readable code rather than copying unexplained fragments."
    ],
    [
      "🧪",
      "Verify",
      "Collect reproducible evidence",
      "Check positive and negative paths, keyboard use and boundaries.",
      "case + expected + observed + release",
      "Self-reported checkboxes are reminders; actual tests must run against the project."
    ],
    [
      "💬",
      "Explain",
      "Demonstrate a reviewed release",
      "Show the user journey, one failure and a documented tradeoff.",
      "problem → design → evidence → limitation",
      "A capstone review is practice, not a certification or a placement guarantee."
    ]
  ]
};
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-premium-trace]").forEach(shell => {
        const stages = wtPremiumTraceStages[shell.dataset.premiumTrace];
        if (!stages || !stages.length) return;
        const find = name => shell.querySelector("[data-trace-" + name + "]");
        const previous = find("previous"), next = find("next"), auto = find("auto");
        const points = Array.from(shell.querySelectorAll("[data-trace-step]"));
        const segments = Array.from(shell.querySelectorAll("[data-url-segment]"));
        let step = 0, timer = null;
        const stop = () => {
            if (timer !== null) window.clearInterval(timer);
            timer = null;
            auto.textContent = "▶ Auto Run";
            auto.setAttribute("aria-pressed", "false");
        };
        const render = () => {
            const stage = stages[step];
            find("status").textContent = "Step " + (step + 1) + " of " + stages.length;
            find("icon").textContent = stage[0];
            find("number").textContent = "STEP " + String(step + 1).padStart(2, "0");
            find("title").textContent = stage[2];
            find("description").textContent = stage[3];
            find("code").textContent = stage[4];
            find("explanation").textContent = stage[5];
            find("progress").style.width = ((step + 1) / stages.length * 100) + "%";
            shell.querySelector("[role=progressbar]").setAttribute("aria-valuenow", String(step + 1));
            previous.disabled = step === 0;
            next.disabled = step === stages.length - 1;
            points.forEach((point, index) => {
                const active = index === step;
                point.classList.toggle("active", active);
                point.setAttribute("aria-pressed", String(active));
            });
            segments.forEach((segment, index) => segment.classList.toggle("active", index === step));
        };
        previous.addEventListener("click", () => {stop();step = Math.max(0, step - 1);render();});
        next.addEventListener("click", () => {stop();step = Math.min(stages.length - 1, step + 1);render();});
        find("reset").addEventListener("click", () => {stop();step = 0;render();});
        points.forEach((point, index) => point.addEventListener("click", () => {stop();step = index;render();}));
        auto.addEventListener("click", () => {
            if (timer !== null) {stop();return;}
            if (step === stages.length - 1) step = 0;
            render();
            auto.textContent = "⏸ Pause";
            auto.setAttribute("aria-pressed", "true");
            timer = window.setInterval(() => {
                step = Math.min(stages.length - 1, step + 1);
                render();
                if (step === stages.length - 1) stop();
            }, 3000);
        });
        document.addEventListener("visibilitychange", () => {if (document.hidden) stop();});
        window.addEventListener("pagehide", stop);
        render();
    });
});
