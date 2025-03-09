export interface NewsArticle {
    title: string;
    numberedTitle: string;
    authorByline: string;
    pubDate: string;
    url: string;
    publication: string;
    headline?: string;  // Optional for backward compatibility
    pubDateTime?: string;  // Optional for backward compatibility
}

export interface AnnotatedNews {
    results: {
        numberedTitle: string;
        headline_criteria_matches: {
            [key: string]: string[];
        };
    }[];
}

// Add new interface for news items with criteria
export interface CriteriaAndLink {
    criteria_name: string;
    url: string;
}

export interface CriteriaMatch {
    source: CitationStep | 'citations';
    criteria: CriteriaAndLink[];
}

export interface AnnotatedNewsItem extends NewsArticle {
    criteria_matches: CriteriaMatch[];
}

export interface CompleteAnnotatedNews {
    news: AnnotatedNewsItem[];
    dateTime: string;
}

export enum CitationStep {
    // Democracy Steps
    RiseOfPopulist = "Rise of Populist Movements",
    AttacksOnDebate = "Attacks on Rational Debate & Truth",
    ErosionOfEthics = "Erosion of Political Ethics",
    UnderminingInstitutions = "Undermining of Democratic Institutions",
    RedefiningCitizenship = "Redefinition of Citizenship & Suppression of Dissent",
    BreakdownOfLaw = "Breakdown of the Rule of Law",
    OnePowerRule = "Moves Toward One-Party Rule & Power Consolidation",
    
    // Nazi Steps
    CreateCrisis = "Create a crisis",
    DemonizeOpponents = "Demonize opponents",
    DeclareEmergency = "Declare a state of emergency",
    UndermineElections = "Undermine elections",
    MakeLawIrrelevant = "Make the rule of law irrelevant",
    RuleByDecree = "Rule by decree",
    
    // Dictator Steps
    PowerOverWelfare = "Leaders Prioritizing Power Over Public Welfare",
    ShrinkingCoalition = "Shrinking the Ruling Coalition to Stay in Power",
    CorruptionPatronage = "Increased Corruption and Patronage",
    AttacksOnPress = "Attacks on Democratic Institutions and the Free Press",
    EconomicInequality = "Economic Growth Benefiting Only the Ruling Class",
    TargetingOpponents = "Political Opponents and Critics Being Targeted",
    ElitesTurning = "Signs of Elites Turning Against the Leader"
}

// Update Citation interface to use the enum
export interface Citation {
    source: string;
    author: string;
    step: CitationStep;
    links: string[];
    pubDate?: string;
    sourceType: 'nazi' | 'dictator' | 'democracy';
}

// Add interface for database row type
export interface CitationRow {
    step: string;
    link: string;
}