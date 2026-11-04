// GTU Registration Assessment — 4 sets (random 1 set per user, stable).
// Master IDs are kept from the source document; each set can repeat ID 6 (stage).
// `tag` on Part 3 options (L/P/N/E) is backend-only and stripped from public payloads.

const option = (key, en, mr, tag) => (tag ? { key, en, mr, tag } : { key, en, mr });

const STAGE_QUESTION = {
    id: 6,
    type: "single",
    required: true,
    en: "Where are you on your business journey?",
    mr: "तुमचा उद्योजकीय प्रवास कोणत्या टप्प्यावर आहे?",
    options: [
        option("A", "Only thinking about it; no idea yet", "फक्त विचार करतोय/करतेय; अजून कल्पना नाही"),
        option("B", "I have an idea but have not started", "कल्पना आहे, पण सुरुवात केलेली नाही"),
        option("C", "Started less than 12 months ago", "सुरू करून १२ महिन्यांपेक्षा कमी झाले"),
        option("D", "Running for 1–3 years", "१–३ वर्षांपासून सुरू आहे"),
        option("E", "Running for 3+ years and want to grow", "३ वर्षांपेक्षा जास्त चालू आहे, आता वाढवायचं आहे"),
    ],
};

// Master ID 6 option -> stage key (used for profile/track).
const STAGE_BY_KEY = {
    A: "explorer",
    B: "idea",
    C: "starter",
    D: "running",
    E: "scaling",
};

const TRACK_BY_STAGE = {
    explorer: { track: 1, trackName: "Spark" },
    idea: { track: 2, trackName: "Start" },
    starter: { track: 2, trackName: "Start" },
    running: { track: 3, trackName: "Run" },
    scaling: { track: 4, trackName: "Scale" },
};

const SET_1 = [
    STAGE_QUESTION,
    {
        id: 3,
        type: "text",
        required: true,
        maxLength: 300,
        en: "Describe the business you want to start or run, and who will buy from you.",
        mr: "तुम्हाला कोणता व्यवसाय सुरू करायचा किंवा चालवायचा आहे आणि तुमच्याकडून कोण खरेदी करेल, ते सांगा.",
        helperEn: "Short text answer, up to 300 characters. If you have no idea yet, write the kind of work that interests you.",
        helperMr: "छोटं लिखित उत्तर, जास्तीत जास्त ३०० अक्षरं. अजून कल्पना नसेल, तर तुम्हाला कोणतं काम आवडतं ते लिहा.",
    },
    {
        id: 5,
        type: "single",
        required: true,
        en: "How do you keep track of money in your work, farm or family business?",
        mr: "तुमच्या कामात, शेतीत किंवा कुटुंबाच्या व्यवसायात पैशांचा हिशेब तुम्ही कसा ठेवता?",
        options: [
            option("A", "I do not keep any record", "कोणतीही नोंद ठेवत नाही"),
            option("B", "I remember it in my head", "हिशेब लक्षात ठेवतो/ठेवते"),
            option("C", "I note income and expenses in a notebook now and then", "कधीकधी वहीत जमा-खर्च लिहितो/लिहिते"),
            option("D", "I write income and expenses every day", "रोज जमा-खर्च लिहितो/लिहिते"),
            option("E", "I use a phone app or Excel", "मोबाईल अॅप किंवा एक्सेल वापरतो/वापरते"),
            option("F", "An accountant keeps my books and files my returns", "हिशेबनीस माझे हिशेब ठेवतो आणि रिटर्न भरतो"),
        ],
    },
    {
        id: 1,
        type: "single",
        required: true,
        en: "How much do you know about registrations and schemes for small businesses (Udyam, GST, FSSAI, loan and subsidy schemes)?",
        mr: "लहान व्यवसायांसाठीच्या नोंदण्या आणि योजनांबद्दल (उद्यम, जीएसटी, FSSAI, कर्ज आणि अनुदान योजना) तुम्हाला किती माहिती आहे?",
        options: [
            option("A", "I have not heard of any of these", "यातलं काहीच ऐकलेलं नाही"),
            option("B", "I have heard the names but do not know how they work", "नावं ऐकली आहेत, पण त्या कशा चालतात ते माहीत नाही"),
            option("C", "I know which ones apply to me but have not applied", "मला कोणत्या लागू होतात ते माहीत आहे, पण अर्ज केलेला नाही"),
            option("D", "I have applied for one or more of them", "एक किंवा अधिक नोंदणी/योजनांसाठी अर्ज केला आहे"),
            option("E", "I hold registrations or have used a scheme, and can guide others", "नोंदणी आहे किंवा योजनेचा लाभ घेतला आहे आणि इतरांना मार्गदर्शन करू शकतो/शकते"),
        ],
    },
    {
        id: 8,
        type: "single",
        required: true,
        en: "Which sector is your idea or business in?",
        mr: "तुमची कल्पना किंवा व्यवसाय कोणत्या क्षेत्रातला आहे?",
        options: [
            option("A", "Agriculture and allied", "शेती आणि पूरक व्यवसाय"),
            option("B", "Food processing", "अन्नप्रक्रिया"),
            option("C", "Dairy, poultry, fisheries", "दुग्धव्यवसाय, कुक्कुटपालन, मत्स्यव्यवसाय"),
            option("D", "Manufacturing and small industry", "उत्पादन आणि लघुउद्योग"),
            option("E", "Trade and retail", "व्यापार आणि किरकोळ विक्री"),
            option("F", "Services (repair, transport, digital)", "सेवा (दुरुस्ती, वाहतूक, डिजिटल)"),
            option("G", "Tourism and hospitality", "पर्यटन आणि आतिथ्य"),
            option("H", "Handicraft and textile", "हस्तकला आणि वस्त्रोद्योग"),
            option("I", "Not decided yet", "अजून ठरवलेलं नाही"),
        ],
    },
    {
        id: 29,
        type: "single",
        required: true,
        en: "You started selling homemade masala or pickle, but first-month sales are very low. What do you do first?",
        mr: "तुम्ही घरगुती मसाले किंवा लोणची विकायला सुरुवात केली, पण पहिल्या महिन्यात विक्री खूप कमी झाली. आधी काय कराल?",
        options: [
            option("A", "Ask the few customers what they liked and disliked, then change accordingly", "आलेल्या ग्राहकांना काय आवडलं-काय नाही ते विचारून त्यानुसार बदल करीन", "L"),
            option("B", "Work out cost, price and target customers on paper before trying again", "पुन्हा प्रयत्न करण्याआधी खर्च, किंमत आणि लक्ष्य ग्राहक कागदावर मांडीन", "P"),
            option("C", "Ask an experienced food entrepreneur or a local shopkeeper for advice", "अनुभवी खाद्य उद्योजक किंवा स्थानिक दुकानदाराचा सल्ला घेईन", "N"),
            option("D", "Quickly try a new place, such as the weekly market or WhatsApp groups, and see what sells", "आठवडी बाजार किंवा व्हॉट्सअॅप ग्रुप अशी नवी जागा लगेच वापरून बघीन", "E"),
        ],
    },
    {
        id: 34,
        type: "single",
        required: true,
        en: "You need ₹2 lakh to start, but you have ₹50,000. What do you do?",
        mr: "व्यवसाय सुरू करायला २ लाख रुपये लागतात, पण तुमच्याकडे ५०,००० रुपये आहेत. तुम्ही काय कराल?",
        options: [
            option("A", "Learn which loan or scheme suits my case and what its rules are", "माझ्यासाठी कोणतं कर्ज किंवा कोणती योजना योग्य आणि त्याचे नियम काय ते समजून घेईन", "L"),
            option("B", "Recalculate whether a smaller setup can run on ₹50,000", "५०,००० रुपयांत चालेल अशा लहान स्वरूपात सुरुवात करता येईल का ते मोजून पाहीन", "P"),
            option("C", "Talk to a bank manager, a mentor or people who have raised funds", "बँक व्यवस्थापक, मार्गदर्शक किंवा निधी मिळवलेल्या लोकांशी बोलीन", "N"),
            option("D", "Start a small trial with what I have and add money as sales come in", "जे आहे त्यात छोटी सुरुवात करून विक्रीतून पैसे वाढवीन", "E"),
        ],
    },
    {
        id: 38,
        type: "single",
        required: true,
        en: "The price of your main raw material suddenly rises by 30%. What do you do?",
        mr: "तुमच्या मुख्य कच्च्या मालाची किंमत अचानक ३०% वाढली. तुम्ही काय कराल?",
        options: [
            option("A", "Find out why the price rose and whether it is temporary", "किंमत का वाढली आणि ती तात्पुरती आहे का ते शोधीन", "L"),
            option("B", "Recalculate my cost and adjust price or quantity", "खर्च पुन्हा मोजून किंमत किंवा प्रमाण बदलीन", "P"),
            option("C", "Buy together with other buyers or find new suppliers through contacts", "इतर खरेदीदारांसोबत मिळून एकत्र खरेदी करीन किंवा ओळखीतून नवे पुरवठादार शोधीन", "N"),
            option("D", "Try a cheaper alternative material on a small batch right away", "स्वस्त पर्यायी माल लहान प्रमाणावर लगेच वापरून बघीन", "E"),
        ],
    },
    {
        id: 42,
        type: "single",
        required: true,
        en: "A buyer asks for your GST number or FSSAI licence, and you do not have it. What do you do?",
        mr: "एक खरेदीदार तुमचा जीएसटी क्रमांक किंवा FSSAI परवाना मागतोय, पण तुमच्याकडे नाही. तुम्ही काय कराल?",
        options: [
            option("A", "First understand which registration applies to my business and when it is compulsory", "माझ्या व्यवसायाला कोणती नोंदणी लागू होते आणि ती कधी बंधनकारक आहे ते आधी समजून घेईन", "L"),
            option("B", "List the documents and costs needed and apply step by step", "लागणारी कागदपत्रं आणि खर्च यांची यादी करून टप्प्याटप्प्यानं अर्ज करीन", "P"),
            option("C", "Ask a CA, a local consultant or a mentor to guide me", "सीए, स्थानिक सल्लागार किंवा मार्गदर्शकाकडून मदत घेईन", "N"),
            option("D", "Start the online application myself right away", "स्वतः ऑनलाइन अर्ज भरायला लगेच सुरुवात करीन", "E"),
        ],
    },
    {
        id: 45,
        type: "single",
        required: true,
        en: "Your business is stable, and a chance comes to open a second outlet in another village. What do you do?",
        mr: "तुमचा व्यवसाय स्थिर आहे आणि दुसऱ्या गावात दुसरी शाखा उघडण्याची संधी आली आहे. तुम्ही काय कराल?",
        options: [
            option("A", "Visit first and study demand, customers and competition there", "आधी तिथे जाऊन मागणी, ग्राहक आणि स्पर्धा तपासीन", "L"),
            option("B", "Prepare a budget and break-even figure before deciding", "निर्णयापूर्वी बजेट आणि नफ्यात येण्याचा बिंदू काढीन", "P"),
            option("C", "Find a trusted local partner or person there", "तिथे विश्वासू स्थानिक भागीदार किंवा व्यक्ती शोधीन", "N"),
            option("D", "Open on a small trial basis, such as a stall or a few days a week, and expand if it works", "स्टॉल किंवा आठवड्यातून काही दिवस अशी लहान चाचणी घेऊन चालल्यास वाढवीन", "E"),
        ],
    },
];

const SET_2 = [
    STAGE_QUESTION,
    {
        id: 4,
        type: "single",
        required: true,
        en: "How do customers find out about your product or service, or how would they?",
        mr: "तुमच्या उत्पादनाबद्दल किंवा सेवेबद्दल ग्राहकांना कसं कळतं, किंवा कसं कळेल?",
        options: [
            option("A", "I have no plan to reach customers yet", "ग्राहकांपर्यंत पोहोचण्याची अजून काही योजना नाही"),
            option("B", "Only through family, friends and word of mouth", "फक्त कुटुंब, मित्र आणि तोंडी प्रसिद्धीतून"),
            option("C", "Through the weekly market, shops or local banners", "आठवडी बाजार, दुकानं किंवा गावातले फलक यातून"),
            option("D", "Through WhatsApp, Instagram, Google listing or dealers beyond my area", "व्हॉट्सअॅप, इन्स्टाग्राम, गुगल लिस्टिंग किंवा परिसराबाहेरच्या वितरकांतून"),
        ],
    },
    {
        id: 7,
        type: "single",
        required: true,
        en: "How is the day-to-day work of your business arranged, or how would you arrange it?",
        mr: "तुमच्या व्यवसायाचं रोजचं काम कसं चालतं, किंवा तुम्ही ते कसं चालवाल?",
        options: [
            option("A", "I have not thought about it yet", "याबद्दल अजून विचार केलेला नाही"),
            option("B", "I do everything alone", "सगळं काम मी एकटाच/एकटीच करतो/करते"),
            option("C", "Family members help when needed", "गरज पडेल तेव्हा कुटुंबातले लोक मदत करतात"),
            option("D", "I have one or two regular helpers or workers", "माझ्याकडे एक-दोन नेहमीचे मदतनीस किंवा कामगार आहेत"),
            option("E", "I have a team, set roles and a regular schedule", "माझ्याकडे टीम, ठरलेल्या भूमिका आणि नियमित वेळापत्रक आहे"),
        ],
    },
    {
        id: 2,
        type: "single",
        required: true,
        en: "Where do you see your work three years from now?",
        mr: "तीन वर्षांनी तुम्ही स्वतःला कामात कुठे पाहता?",
        options: [
            option("A", "Working in a job in a city", "शहरात नोकरी करताना"),
            option("B", "Working in a job or small work near my village", "गावाजवळ नोकरी किंवा छोटं काम करताना"),
            option("C", "Running my own business in my village or taluka", "माझ्या गावात किंवा तालुक्यात स्वतःचा व्यवसाय चालवताना"),
            option("D", "Running a village business that also gives jobs to others", "गावात असा व्यवसाय चालवताना जो इतरांनाही रोजगार देतो"),
        ],
    },
    {
        id: 49,
        type: "multi",
        required: true,
        maxSelect: 3,
        en: "What are the biggest resources in your village? Choose up to 3.",
        mr: "तुमच्या गावातली सर्वात मोठी संसाधनं कोणती? जास्तीत जास्त ३ निवडा.",
        options: [
            option("A", "Farm produce (grains, fruits, vegetables)", "शेतमाल (धान्य, फळं, भाज्या)"),
            option("B", "Dairy and livestock", "दुग्धव्यवसाय आणि पशुधन"),
            option("C", "Forest and local raw materials", "जंगल आणि स्थानिक कच्चा माल"),
            option("D", "Skilled artisans and craftspeople", "कुशल कारागीर"),
            option("E", "Youth and available manpower", "तरुण आणि उपलब्ध मनुष्यबळ"),
            option("F", "Tourism, temple or heritage place", "पर्यटन, मंदिर किंवा वारसा स्थळ"),
            option("G", "Nearness to a highway, market or industrial area", "महामार्ग, बाजार किंवा औद्योगिक क्षेत्राची जवळीक"),
            option("H", "Water and irrigation", "पाणी आणि सिंचन"),
            option("I", "Other", "इतर"),
        ],
    },
    {
        id: 52,
        type: "single",
        required: true,
        en: "What is your biggest barrier right now?",
        mr: "सध्या तुमची सर्वात मोठी अडचण कोणती?",
        options: [
            option("A", "Money or capital", "पैसा किंवा भांडवल"),
            option("B", "Not enough knowledge or guidance", "पुरेशी माहिती किंवा मार्गदर्शन नाही"),
            option("C", "Finding customers or a market", "ग्राहक किंवा बाजारपेठ मिळवणं"),
            option("D", "Raw material or supply", "कच्चा माल किंवा पुरवठा"),
            option("E", "Skilled workers", "कुशल कामगार"),
            option("F", "Road, power, water or internet", "रस्ता, वीज, पाणी किंवा इंटरनेट"),
            option("G", "Paperwork and licences", "कागदपत्रं आणि परवाने"),
            option("H", "Family support or fear of risk", "कुटुंबाचा पाठिंबा किंवा जोखमीची भीती"),
        ],
    },
    {
        id: 30,
        type: "single",
        required: true,
        en: "A seller from the next taluka sells a similar product at a lower price. What do you do?",
        mr: "शेजारच्या तालुक्यातला एक विक्रेता तुमच्यासारखीच वस्तू कमी किमतीत विकतो. तुम्ही काय कराल?",
        options: [
            option("A", "Find out why customers choose or avoid my product, then decide", "ग्राहक माझा माल का घेतात किंवा का टाळतात ते शोधून मग ठरवीन", "L"),
            option("B", "Recalculate my cost and margin to see how low I can go", "माझा खर्च आणि नफा पुन्हा मोजून किती कमी किंमत परवडेल ते पाहीन", "P"),
            option("C", "Talk to other local sellers and customers about working together or sharing the market", "इतर स्थानिक विक्रेते आणि ग्राहकांशी बोलून एकत्र काम करण्याचा किंवा बाजार वाटून घेण्याचा विचार करीन", "N"),
            option("D", "Launch a small offer or better packing right away and watch the response", "लगेच छोटी ऑफर किंवा चांगलं पॅकिंग आणून प्रतिसाद पाहीन", "E"),
        ],
    },
    {
        id: 35,
        type: "single",
        required: true,
        en: "A bank offers you a loan, but the monthly EMI feels heavy. What do you do?",
        mr: "बँक कर्ज देतेय, पण मासिक हप्ता जड वाटतोय. तुम्ही काय कराल?",
        options: [
            option("A", "Ask the bank to explain the interest, charges and repayment terms fully", "व्याज, शुल्क आणि परतफेडीच्या अटी बँकेकडून नीट समजून घेईन", "L"),
            option("B", "Compare my expected monthly income with the EMI before deciding", "हप्त्याच्या तुलनेत माझं अपेक्षित मासिक उत्पन्न तपासून मग ठरवीन", "P"),
            option("C", "Ask someone who took a business loan about their experience", "ज्यांनी व्यवसायासाठी कर्ज घेतलंय त्यांचा अनुभव विचारीन", "N"),
            option("D", "Ask for a smaller amount or a longer period and begin", "कमी रक्कम किंवा जास्त कालावधी मागून सुरुवात करीन", "E"),
        ],
    },
    {
        id: 39,
        type: "single",
        required: true,
        en: "Your key machine stops working in the peak season. What do you do?",
        mr: "हंगामाच्या गर्दीत तुमचं मुख्य यंत्र बंद पडलं. तुम्ही काय कराल?",
        options: [
            option("A", "Find out exactly what failed and how to prevent it next time", "नेमका बिघाड काय झाला आणि पुन्हा कसा टाळायचा ते समजून घेईन", "L"),
            option("B", "Compare repair cost with a new machine and make a maintenance schedule", "दुरुस्ती आणि नवं यंत्र यांचा खर्च तुलना करून देखभालीचं वेळापत्रक बनवीन", "P"),
            option("C", "Call a trusted mechanic or a nearby unit owner for help", "विश्वासू मेकॅनिक किंवा जवळच्या युनिट मालकाकडून मदत घेईन", "N"),
            option("D", "Arrange a temporary fix or rent a machine and keep production going", "तात्पुरती दुरुस्ती किंवा भाड्याने यंत्र घेऊन उत्पादन सुरू ठेवीन", "E"),
        ],
    },
    {
        id: 43,
        type: "single",
        required: true,
        en: "A friend tells you about a new government subsidy scheme. What do you do?",
        mr: "मित्राकडून एका नव्या सरकारी अनुदान योजनेबद्दल कळलं. तुम्ही काय कराल?",
        options: [
            option("A", "Read the rules and eligibility from the official source", "अधिकृत स्रोतातून योजनेचे नियम आणि पात्रता वाचून घेईन", "L"),
            option("B", "Check if it fits my plan and list the documents required", "योजना माझ्या आराखड्याला जुळते का ते पाहून कागदपत्रांची यादी करीन", "P"),
            option("C", "Ask the District Industries Centre, a bank, or someone who has used the scheme", "जिल्हा उद्योग केंद्र, बँक किंवा योजनेचा लाभ घेतलेल्यांना विचारीन", "N"),
            option("D", "Apply quickly before the last date and sort out issues as they come", "शेवटची तारीख जाण्याआधी लगेच अर्ज करून अडचणी आल्या की सोडवीन", "E"),
        ],
    },
    {
        id: 46,
        type: "single",
        required: true,
        en: "A friend wants to become a partner in your business. What do you do?",
        mr: "एका मित्राला तुमच्या व्यवसायात भागीदार व्हायचं आहे. तुम्ही काय कराल?",
        options: [
            option("A", "Understand what he brings (skill, money, time) and why he wants to join", "तो काय आणतो (कौशल्य, पैसा, वेळ) आणि का सामील व्हायचं आहे ते समजून घेईन", "L"),
            option("B", "Write down roles, profit sharing and exit terms before starting", "भूमिका, नफ्याची वाटणी आणि बाहेर पडण्याच्या अटी लेखी ठरवीन", "P"),
            option("C", "Take advice from elders or mentors who have seen partnerships succeed or fail", "भागीदारी यशस्वी किंवा अयशस्वी झालेलं पाहिलेल्या अनुभवी लोकांचा सल्ला घेईन", "N"),
            option("D", "First work together on one small project and see how it goes", "आधी एका छोट्या कामात एकत्र काम करून बघीन", "E"),
        ],
    },
];

const SET_3 = [
    STAGE_QUESTION,
    {
        id: 50,
        type: "single",
        required: true,
        en: "How far is the nearest market town from your village?",
        mr: "तुमच्या गावापासून सर्वात जवळची बाजारपेठ किती अंतरावर आहे?",
        options: [
            option("A", "Under 5 km", "५ किमी पेक्षा कमी"),
            option("B", "5–15 km", "५–१५ किमी"),
            option("C", "16–30 km", "१६–३० किमी"),
            option("D", "More than 30 km", "३० किमी पेक्षा जास्त"),
        ],
    },
    {
        id: 51,
        type: "multi",
        required: true,
        en: "What do you already have for starting a business? Choose all that apply.",
        mr: "व्यवसाय सुरू करण्यासाठी तुमच्याकडे आधीपासून काय आहे? लागू असलेले सर्व निवडा.",
        options: [
            option("A", "Space, land or a shed", "जागा, जमीन किंवा शेड"),
            option("B", "Machines or tools", "यंत्रं किंवा अवजारं"),
            option("C", "A skill or training", "कौशल्य किंवा प्रशिक्षण"),
            option("D", "Some customers or buyers", "काही ग्राहक किंवा खरेदीदार"),
            option("E", "Savings or capital", "बचत किंवा भांडवल"),
            option("F", "A smartphone and internet", "स्मार्टफोन आणि इंटरनेट"),
            option("G", "Nothing yet", "अजून काही नाही"),
        ],
    },
    {
        id: 53,
        type: "single",
        required: true,
        en: "How does your family feel about you starting or growing a business?",
        mr: "तुम्ही व्यवसाय सुरू करण्याबद्दल किंवा वाढवण्याबद्दल तुमच्या कुटुंबाला काय वाटतं?",
        options: [
            option("A", "They fully support me", "ते पूर्ण पाठिंबा देतात"),
            option("B", "They are neutral or unsure", "ते तटस्थ आहेत किंवा खात्री नाही"),
            option("C", "They are worried and prefer a job", "त्यांना काळजी वाटते आणि नोकरी करावी असं वाटतं"),
            option("D", "I have not discussed it yet", "अजून चर्चा केलेली नाही"),
        ],
    },
    {
        id: 54,
        type: "single",
        required: true,
        en: "How much time can you give to your business each week?",
        mr: "तुम्ही दर आठवड्याला व्यवसायासाठी किती वेळ देऊ शकता?",
        options: [
            option("A", "Under 10 hours", "१० तासांपेक्षा कमी"),
            option("B", "10–20 hours", "१०–२० तास"),
            option("C", "20–40 hours", "२०–४० तास"),
            option("D", "Full time", "पूर्ण वेळ"),
        ],
    },
    {
        id: 55,
        type: "single",
        required: true,
        en: "How much do you plan to invest in the first 6 months?",
        mr: "पहिल्या ६ महिन्यांत तुम्ही किती गुंतवणूक करण्याचा विचार करता?",
        options: [
            option("A", "Under ₹50,000", "₹५०,००० पेक्षा कमी"),
            option("B", "₹50,000–₹2 lakh", "₹५०,००० ते ₹२ लाख"),
            option("C", "₹2–10 lakh", "₹२ ते १० लाख"),
            option("D", "More than ₹10 lakh", "₹१० लाखांपेक्षा जास्त"),
            option("E", "Not sure yet", "अजून निश्चित नाही"),
        ],
    },
    {
        id: 31,
        type: "single",
        required: true,
        en: "Your product is good, but only nearby villages know it. How do you reach customers beyond them?",
        mr: "तुमचं उत्पादन चांगलं आहे, पण फक्त आजूबाजूच्या गावांनाच माहीत आहे. गावाबाहेरचे ग्राहक कसे मिळवाल?",
        options: [
            option("A", "See which products or areas get the most response and focus there", "कोणत्या उत्पादनाला किंवा भागातून जास्त प्रतिसाद मिळतो ते पाहून तिथे लक्ष केंद्रित करीन", "L"),
            option("B", "Make a simple plan with target area, budget and a monthly sales goal", "लक्ष्य भाग, बजेट आणि महिन्याचं विक्री उद्दिष्ट असा साधा आराखडा बनवीन", "P"),
            option("C", "Join business groups or tie up with dealers, shops or online sellers", "व्यावसायिक गटांत सहभागी होईन किंवा वितरक, दुकानदार वा ऑनलाइन विक्रेत्यांशी जोडून घेईन", "N"),
            option("D", "Start posting photos and videos on WhatsApp and Instagram right away", "व्हॉट्सअॅप आणि इन्स्टाग्रामवर फोटो-व्हिडिओ टाकायला लगेच सुरुवात करीन", "E"),
        ],
    },
    {
        id: 36,
        type: "single",
        required: true,
        en: "Customers buy on credit (udhaar) and pay late, so your raw material money is stuck. What do you do?",
        mr: "ग्राहक उधारीवर माल घेतात आणि पैसे उशिरा देतात, त्यामुळे कच्च्या मालाचे पैसे अडकले आहेत. तुम्ही काय कराल?",
        options: [
            option("A", "Find from my records which customers delay and why", "कोणते ग्राहक आणि का उशीर करतात ते नोंदींवरून शोधीन", "L"),
            option("B", "Set a clear credit limit and payment date for every customer", "प्रत्येक ग्राहकासाठी उधारीची मर्यादा आणि पैसे देण्याची स्पष्ट तारीख ठरवीन", "P"),
            option("C", "Talk to the customers and trusted people to find a mutual solution", "ग्राहकांशी आणि विश्वासू लोकांशी बोलून परस्पर सोयीचा मार्ग काढीन", "N"),
            option("D", "Offer a small discount on cash or advance payment from now on", "यापुढे रोख किंवा आगाऊ पैशांवर छोटी सूट देऊन बघीन", "E"),
        ],
    },
    {
        id: 40,
        type: "single",
        required: true,
        en: "A trader places an order three times your usual capacity, with a 15-day deadline. What do you do?",
        mr: "एका व्यापाऱ्याने तुमच्या नेहमीच्या क्षमतेच्या तिप्पट ऑर्डर दिली आहे, मुदत १५ दिवस. तुम्ही काय कराल?",
        options: [
            option("A", "Ask the trader for details on quality, packing and payment terms", "गुणवत्ता, पॅकिंग आणि पेमेंटच्या अटींबद्दल व्यापाऱ्याकडून सविस्तर विचारून घेईन", "L"),
            option("B", "Calculate if I can finish in time and at what cost before accepting", "वेळेत पूर्ण होईल का आणि खर्च किती ते मोजूनच ऑर्डर स्वीकारीन", "P"),
            option("C", "Get workers, SHG women or nearby units to share the work", "कामगार, बचत गटाच्या महिला किंवा जवळच्या युनिट्सना सोबत घेऊन काम वाटून घेईन", "N"),
            option("D", "Accept it and manage with extra hours and extra helpers", "ऑर्डर स्वीकारून जादा वेळ काम आणि अतिरिक्त मदतनीस घेऊन पूर्ण करीन", "E"),
        ],
    },
    {
        id: 44,
        type: "single",
        required: true,
        en: "At month-end you cannot tell whether the business really made a profit. What do you do?",
        mr: "महिन्याच्या शेवटी व्यवसायाला खरंच नफा झाला की नाही ते तुम्हाला सांगता येत नाही. तुम्ही काय कराल?",
        options: [
            option("A", "Go through bills and notes to see where the money went", "बिलं आणि नोंदी तपासून पैसा कुठे गेला ते शोधीन", "L"),
            option("B", "Start a simple daily income-expense register (notebook or app)", "रोजचा साधा जमा-खर्चाचा हिशेब (वही किंवा अॅप) सुरू करीन", "P"),
            option("C", "Ask an accountant or a fellow entrepreneur how they track it", "हिशेबनीस किंवा सहकारी उद्योजक हिशेब कसा ठेवतात ते विचारीन", "N"),
            option("D", "Try a free accounting app this week and see if it works", "या आठवड्यात एखादं मोफत अकाउंटिंग अॅप वापरून बघीन", "E"),
        ],
    },
    {
        id: 47,
        type: "single",
        required: true,
        en: "Drought or a market slump halves your sales for two months. What do you do?",
        mr: "दुष्काळ किंवा बाजारातल्या मंदीमुळे दोन महिने विक्री निम्म्यावर आली. तुम्ही काय कराल?",
        options: [
            option("A", "Find out what exactly changed and which products still sell", "नेमकं काय बदललं आणि कोणती उत्पादनं अजून चालतात ते शोधीन", "L"),
            option("B", "Cut costs, plan the lean months and keep a small reserve", "खर्चात कपात, कठीण महिन्यांचं नियोजन आणि थोडा राखीव निधी ठेवीन", "P"),
            option("C", "Reach out to other entrepreneurs, associations or GTU for support", "इतर उद्योजक, संघटना किंवा GTU कडून मदत आणि मार्गदर्शन घेईन", "N"),
            option("D", "Quickly start a different product or service that suits the season", "या काळाला योग्य असं वेगळं उत्पादन किंवा सेवा लगेच सुरू करीन", "E"),
        ],
    },
];

const SET_4 = [
    STAGE_QUESTION,
    {
        id: 56,
        type: "multi",
        required: true,
        maxSelect: 3,
        en: "What help do you want most from GTU? Choose up to 3.",
        mr: "GTU कडून तुम्हाला सर्वात जास्त कोणती मदत हवी आहे? जास्तीत जास्त ३ निवडा.",
        options: [
            option("A", "Choosing and planning a business idea", "व्यवसायकल्पना निवडणं आणि आराखडा बनवणं"),
            option("B", "Skill training", "कौशल्य प्रशिक्षण"),
            option("C", "A mentor", "मार्गदर्शक"),
            option("D", "Loan and scheme help", "कर्ज आणि योजनांसाठी मदत"),
            option("E", "Registrations, GST and legal help", "नोंदण्या, जीएसटी आणि कायदेशीर मदत"),
            option("F", "Marketing and branding", "मार्केटिंग आणि ब्रँडिंग"),
            option("G", "Buyers and market linkage", "खरेदीदार आणि बाजारपेठेशी जोडणी"),
            option("H", "Digital and technology tools", "डिजिटल आणि तंत्रज्ञान साधनं"),
            option("I", "Meeting other entrepreneurs", "इतर उद्योजकांशी भेट"),
        ],
    },
    {
        id: 57,
        type: "single",
        required: true,
        en: "How do you prefer to learn?",
        mr: "तुम्हाला शिकायला कोणती पद्धत आवडते?",
        options: [
            option("A", "A workshop in my taluka", "माझ्या तालुक्यातली कार्यशाळा"),
            option("B", "Live online sessions", "ऑनलाइन लाइव्ह सत्रं"),
            option("C", "Short Marathi videos", "मराठीतले छोटे व्हिडिओ"),
            option("D", "A WhatsApp group with guidance", "मार्गदर्शन देणारा व्हॉट्सअॅप ग्रुप"),
            option("E", "One-to-one mentoring", "वैयक्तिक मार्गदर्शन"),
        ],
    },
    {
        id: 58,
        type: "single",
        required: true,
        en: "May GTU share your story or business to inspire others (with your permission before posting)?",
        mr: "तुमची गोष्ट किंवा व्यवसाय इतरांना प्रेरणा देण्यासाठी GTU शेअर करू शकतं का (पोस्ट करण्यापूर्वी तुमची परवानगी घेतली जाईल)?",
        options: [
            option("A", "Yes", "हो"),
            option("B", "Maybe later", "नंतर ठरवीन"),
            option("C", "No", "नाही"),
        ],
    },
    {
        id: 59,
        type: "text",
        required: false,
        maxLength: 300,
        en: "(Optional) What is the biggest business opportunity in your village?",
        mr: "(ऐच्छिक) तुमच्या गावातली सर्वात मोठी व्यवसायसंधी कोणती?",
        helperEn: "Short text answer, up to 300 characters.",
        helperMr: "छोटं लिखित उत्तर, जास्तीत जास्त ३०० अक्षरं.",
    },
    {
        id: 60,
        type: "text",
        required: false,
        maxLength: 300,
        en: "(Optional) What is the biggest obstacle to doing business in your village?",
        mr: "(ऐच्छिक) तुमच्या गावात व्यवसाय करण्यातली सर्वात मोठी अडचण कोणती?",
        helperEn: "Short text answer, up to 300 characters.",
        helperMr: "छोटं लिखित उत्तर, जास्तीत जास्त ३०० अक्षरं.",
    },
    {
        id: 32,
        type: "single",
        required: true,
        en: "A customer complains about poor quality in the village WhatsApp group. What do you do?",
        mr: "एका ग्राहकाने गावाच्या व्हॉट्सअॅप ग्रुपवर गुणवत्ता खराब असल्याची तक्रार केली आहे. तुम्ही काय कराल?",
        options: [
            option("A", "Find out exactly what went wrong and fix the root cause", "नेमकं काय चुकलं ते शोधून त्याचं मूळ कारण दूर करीन", "L"),
            option("B", "Make a simple quality checklist so it does not repeat", "पुन्हा असं होऊ नये म्हणून गुणवत्ता तपासणीची साधी यादी बनवीन", "P"),
            option("C", "Meet the customer, listen, and ask a trusted elder or mentor how to handle it", "ग्राहकाला भेटून ऐकून घेईन आणि विश्वासू ज्येष्ठ व्यक्ती किंवा मार्गदर्शकाचा सल्ला घेईन", "N"),
            option("D", "Replace the item or refund quickly and reply politely in the group", "वस्तू लगेच बदलून देईन किंवा पैसे परत करीन आणि ग्रुपवर नम्रपणे उत्तर देईन", "E"),
        ],
    },
    {
        id: 33,
        type: "single",
        required: true,
        en: "Diwali or the village fair (jatra) is three weeks away. How do you use the chance?",
        mr: "दिवाळी किंवा गावची यात्रा तीन आठवड्यांवर आली आहे. या संधीचा कसा उपयोग कराल?",
        options: [
            option("A", "Recall what people bought last festival season and decide from that", "मागच्या सणात लोकांनी काय खरेदी केलं ते आठवून/तपासून ठरवीन", "L"),
            option("B", "Plan stock, cost and expected sales in advance", "माल, खर्च आणि अपेक्षित विक्रीचं आधीच नियोजन करीन", "P"),
            option("C", "Ask local groups, SHGs or the Gram Panchayat for a stall or bulk orders", "स्थानिक गट, बचत गट किंवा ग्रामपंचायतीकडून स्टॉल किंवा मोठ्या ऑर्डर मिळवण्याचा प्रयत्न करीन", "N"),
            option("D", "Quickly make a festival special product or gift pack and start selling", "सणासाठी खास उत्पादन किंवा भेटवस्तू पॅक लगेच बनवून विकायला सुरुवात करीन", "E"),
        ],
    },
    {
        id: 37,
        type: "single",
        required: true,
        en: "Your business earns its first good profit of ₹30,000 in a month. What do you do with it?",
        mr: "व्यवसायाला एका महिन्यात पहिल्यांदा ३०,००० रुपयांचा चांगला नफा झाला. तुम्ही त्याचं काय कराल?",
        options: [
            option("A", "Study which product or customer gave this profit so I can repeat it", "हा नफा कोणत्या उत्पादनातून किंवा ग्राहकांकडून आला ते अभ्यासून पुन्हा मिळवीन", "L"),
            option("B", "Divide it between savings, running costs and growth", "बचत, चालू खर्च आणि वाढ यांच्यात वाटून ठेवीन", "P"),
            option("C", "Discuss with a mentor or fellow entrepreneurs where to invest it", "कुठे गुंतवायचं याबद्दल मार्गदर्शक किंवा सहकारी उद्योजकांशी चर्चा करीन", "N"),
            option("D", "Put most of it back into the business to grow faster", "बहुतेक रक्कम व्यवसायात परत लावून झपाट्याने वाढवीन", "E"),
        ],
    },
    {
        id: 41,
        type: "single",
        required: true,
        en: "A trained worker suddenly leaves for a job in the city. What do you do?",
        mr: "तुमच्याकडे प्रशिक्षित झालेला कामगार अचानक शहरात नोकरीसाठी निघून गेला. तुम्ही काय कराल?",
        options: [
            option("A", "Ask why he left (pay, hours, growth) and learn from it", "तो का गेला (पगार, वेळ, प्रगती) ते विचारून त्यातून शिकीन", "L"),
            option("B", "Write a simple work guide so new people can be trained faster", "नवीन माणसं पटकन शिकावीत म्हणून कामाची साधी मार्गदर्शिका बनवीन", "P"),
            option("C", "Ask local youth, ITI students or SHGs to find new workers", "स्थानिक तरुण, आयटीआयचे विद्यार्थी किंवा बचत गटांतून नवे कामगार शोधीन", "N"),
            option("D", "Take a new local youth and start training him right away", "गावातल्या नव्या तरुणाला लगेच कामावर घेऊन प्रशिक्षण सुरू करीन", "E"),
        ],
    },
    {
        id: 48,
        type: "single",
        required: true,
        en: "Your business is growing and you can now give jobs to five village youth. What do you do?",
        mr: "तुमचा व्यवसाय वाढतोय आणि गावातल्या पाच तरुणांना रोजगार देता येईल अशी स्थिती आली आहे. तुम्ही काय कराल?",
        options: [
            option("A", "Learn what skills they have and what training they need", "त्यांच्याकडे कोणती कौशल्यं आहेत आणि कोणतं प्रशिक्षण लागेल ते समजून घेईन", "L"),
            option("B", "Plan roles, pay and work schedule before hiring", "नेमणुकीआधी भूमिका, पगार आणि कामाचं वेळापत्रक ठरवीन", "P"),
            option("C", "Involve the Gram Panchayat, SHGs and youth groups to find the right people", "योग्य माणसांसाठी ग्रामपंचायत, बचत गट आणि तरुण मंडळांना सोबत घेईन", "N"),
            option("D", "Hire one or two first, train them on the job, then add more", "आधी एक-दोघांना कामावर घेऊन प्रशिक्षण देईन आणि मग संख्या वाढवीन", "E"),
        ],
    },
];

const ASSESSMENT_SETS = { 1: SET_1, 2: SET_2, 3: SET_3, 4: SET_4 };

const SET_IDS = [1, 2, 3, 4];

const getSet = (setId) => ASSESSMENT_SETS[setId] || null;

const getQuestion = (setId, questionId) => {
    const set = getSet(setId);
    if (!set) return null;
    return set.find((q) => q.id === questionId) || null;
};

const getQuestionCount = (setId) => {
    const set = getSet(setId);
    return set ? set.length : 0;
};

// Public payload: no answer tags, no master-only fields.
const getPublicQuestions = (setId) => {
    const set = getSet(setId);
    if (!set) return [];
    return set.map((q) => ({
        id: q.id,
        type: q.type,
        required: q.required !== false,
        maxSelect: q.maxSelect || null,
        maxLength: q.maxLength || null,
        en: q.en,
        mr: q.mr,
        helperEn: q.helperEn || "",
        helperMr: q.helperMr || "",
        options: (q.options || []).map((o) => ({ key: o.key, en: o.en, mr: o.mr })),
    }));
};

const getOption = (setId, questionId, key) => {
    const q = getQuestion(setId, questionId);
    if (!q || !q.options) return null;
    return q.options.find((o) => o.key === key) || null;
};

const getScoringTags = (setId) => {
    const tags = {};
    const set = getSet(setId);
    if (!set) return tags;
    for (const q of set) {
        if (!q.options) continue;
        for (const o of q.options) {
            if (o.tag) {
                if (!tags[q.id]) tags[q.id] = {};
                tags[q.id][o.key] = o.tag;
            }
        }
    }
    return tags;
};

module.exports = {
    ASSESSMENT_SETS,
    SET_IDS,
    STAGE_BY_KEY,
    TRACK_BY_STAGE,
    getSet,
    getQuestion,
    getQuestionCount,
    getPublicQuestions,
    getOption,
    getScoringTags,
};
