import { config } from "dotenv";
import path from 'path';
import { checkPerigonHealth, fetchNews } from "./services/fetchNews";
import { 
    checkOpenAIHealth, 
    analyzeNewsWithGPT, 
    sortAnalysisByMatches,
    createNumberedTitlesString,
    mergeArticlesWithAnalysis 
} from "./services/analyzeNews";
import { saveHeadlines, saveAnnotatedNews, loadAnnotatedNews } from "./services/dbService";
import { writeMarkdownFile } from "./services/markdownService";
import { initCitationsDb, insertCitations, ALL_CITATIONS, generateCitationsJson } from './services/citations';
import { NewsArticle, AnnotatedNews, CompleteAnnotatedNews } from "./types";
import { logger } from './services/logger';

config(); // Load environment variables

// API Keys
const PERIGON_API_KEY: string = process.env.PERIGON_API_KEY!;
const PERIGON_API_URL: string = "https://api.goperigon.com/v1/all";
const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY!;
const OUTPUT_MARKDOWN_DIR: string = path.join(__dirname, "../../src/content/");

// Keep the prompt constant
const myPrompt: string = `i will give a list of criteria from 3 main sources: 7 steps from democracy to dictator, lessons from nazis rusing o power, and dictatos hanbook. here's the criteria:

## 7 Steps from Democracy to Dictatorship
To prevent the dismantling of democracy, news consumers, journalists, and policymakers should watch for key warning signs based on Ece Temelkuran's **7 steps from democracy to dictatorship**. These serve as **criteria for news to monitor** in order to safeguard democratic institutions:

### **1. Rise of Populist Movements**

- Watch for news on political figures or movements claiming to be the sole voice of "the people" while demonizing opposition.
- Be wary of leaders promoting **us vs. them** narratives.

### **2. Attacks on Rational Debate & Truth**

- Monitor disinformation campaigns, **attacks on the free press**, and the spread of conspiracy theories.
- Look for efforts to **delegitimize journalists, scientists, and experts**.

### **3. Erosion of Political Ethics**

- Identify corruption scandals that are **downplayed or normalized**.
- Be cautious of **political leaders disregarding accountability** or refusing to uphold traditional democratic norms.

### **4. Undermining of Democratic Institutions**

- Watch for **attacks on independent courts, election commissions, and watchdog organizations**.
- Look for leaders stacking institutions with **loyalists instead of qualified professionals**.

### **5. Redefinition of Citizenship & Suppression of Dissent**

- Be alert to news about **new laws restricting voting rights**, freedom of speech, or **increased targeting of minorities**.
- Follow attempts to **demonize activists, opposition groups, or marginalized communities**.

### **6. Breakdown of the Rule of Law**

- Investigate **news on leaders ignoring legal checks and balances**.
- Watch for the use of the **police, military, or courts to suppress opposition**.

### **7. Moves Toward One-Party Rule & Power Consolidation**

- Look for **efforts to silence or disband opposition parties**.
- Follow reports on **election manipulation, indefinite rule extensions, or constitutional changes benefiting a leader**.

## Nazis Rise to Power
To prevent the dismantling of democracy and the rise of authoritarian rule, news consumers, journalists, and policymakers should be vigilant for **early warning signs** based on the steps the Nazis took to seize power. These serve as **criteria for news to monitor** in order to safeguard democratic institutions.

---
Based on the criteria for how the Nazis rose to power, here are the i relevant citations:

1. Create a crisis:  
    The Nazis exploited the Reichstag fire to gain approval for extreme measures
    
2. Demonize opponents:  
    Hitler blamed Jews for Germany's moral and economic problems, portraying them as behind both communism and international capitalism
    
3. Declare a state of emergency:  
    A state of emergency was declared based on the Reichstag Fire Decree, enabling a violent crackdown against the Nazis' political enemies
    
4. Undermine elections:  
    The Nazis prevented 81 Communists and 26 Social Democrats from taking their seats in parliament, detaining them in Nazi-controlled camps
    
5. Make the rule of law irrelevant:  
    The Enabling Act suspended important provisions of the German constitution, especially those safeguarding individual rights and due process of law
    
6. Rule by decree:  
    The Enabling Act allowed Hitler to enact laws without interference from the president or Reichstag for a period of four years
    

## Dictator's Handbook
To prevent the **dismantling of democracy**, news consumers, journalists, and policymakers should watch for **warning signs** based on insights from _The Dictator’s Handbook_. These serve as **criteria for news to monitor**, helping safeguard democratic institutions by identifying when leaders manipulate power for self-interest.

---

### **1. Leaders Prioritizing Power Over Public Welfare**

- **Watch for leaders prioritizing personal survival over national interests**, such as making policies that only benefit their inner circle.
- **Be alert to leaders undermining democratic processes** (e.g., postponing elections, ignoring court rulings, or consolidating executive power).

### **2. Shrinking the Ruling Coalition to Stay in Power**

- **Monitor voter suppression efforts**, such as restrictive voting laws, gerrymandering, or limiting political opposition.
- **Follow reports on media takeovers**, censorship, or government influence over the judiciary, which reduce democratic checks.

### **3. Increased Corruption and Patronage**

- **Be cautious of government contracts, appointments, or funding being directed to loyalists instead of being merit-based**.
- **Track money trails**—watch for suspicious wealth accumulation among government insiders, misuse of foreign aid, or unaccounted state funds.

### **4. Attacks on Democratic Institutions and the Free Press**

- **Follow efforts to weaken institutions** like election commissions, courts, or anti-corruption agencies.
- **Watch for increasing media censorship**, journalist arrests, and state-controlled narratives dominating public discourse.

### **5. Economic Growth Benefiting Only the Ruling Class**

- **Scrutinize economic policies that concentrate wealth among political elites while ordinary citizens struggle**.
- **Monitor international aid distribution**—is it being used for national development, or is it propping up a corrupt regime?

### **6. Political Opponents and Critics Being Targeted**

- **Look for signs of increasing political repression**, including arrests, surveillance, and harassment of opposition leaders or activists.
- **Pay attention to laws being passed to criminalize dissent**, such as labeling opposition groups as "terrorists" or banning protests.

### **7. Signs of Elites Turning Against the Leader**

- **Observe defections from key allies**—when major politicians, military leaders, or business elites start distancing themselves from the ruling party.
- **Be aware of mass resignations or scandals** that suggest internal conflicts within the government.

now, i will give you numbered headlines. i want you to match (if possible) the headline with as many relevant criteria from above.  
I want you generate valid json that looks like this:

{ 
 "results":
 [
   { 
    "numberedTitle": [foo],
     "criteria_matches": 
     [ 
       {"7 signs": [bar]}
     ]
   },
   { 
    "numberedTitle": [bar],
     "criteria_matches": 
     [ 
       {"nazis": [bar]},
       {"nazis": [foo]}
     ]
   },
      { 
    "numberedTitle": [bar],
    "criteria_matches": [ ]
   },
 
 ]


here  are the headlines. make sure not to remove the numbers:
 1. Trump's address to Congress
1. Congress MLC Teenmaar Mallanna says Revanth Reddy weakening Congress to benefit BJP
2. Trump's full address to Congress
3. FactChecking Trump's Address to Congress
4. Trump’s annual address to Congress
5. President Trump's address to Congress
6. Bloomberg Daybreak: Trump Addresses Congress
7. EDITORIAL: Congress, stop the purge
8. Congress reacts to Trump's speech
9. Exclusive: Trump Administration Suspends Military Deportation Flights - Video API
10. Undocumented woman shares mass deportation fears under Trump policy
11. UK Refuses to Pay Rwanda for Scrapped Deportation Deal
12. Trump administration halts deportation flights with military aircraft: Report
13. ‘It’s heartbreaking': Mass. Rep. Pressley shares constituents’ deportation fears
14. Chris Bianco says Trump's mass deportation threats are already hurting restaurants
15. Our deportation and immigration coverage: Everything you need to know in North Jersey
16. Evaluating President Trump's Deportation Policies: Actions, Impacts, and Reactions - Lake County Florida News
`

// Main execution function
async function main(): Promise<void> {
    try {
        //
        // STEP 1: Health Checks
        // Verify both APIs are available before proceeding
        //
        logger.info("Checking API health...");
        const isPerigonHealthy = await checkPerigonHealth(PERIGON_API_KEY);
        if (!isPerigonHealthy) {
            throw new Error("Perigon API is not healthy");
        }
        
        const isOpenAIHealthy = await checkOpenAIHealth(OPENAI_API_KEY);
        if (!isOpenAIHealthy) {
            throw new Error("OpenAI API is not healthy");
        }
        logger.success("All APIs are healthy");

        //
        // STEP 2: Data Collection
        // Fetch news articles from Perigon API
        //
        logger.info("Fetching news articles...");
        const articles = await fetchNews(PERIGON_API_KEY);
        if (articles.length === 0) {
            throw new Error("No articles fetched");
        }
        logger.success(`Fetched ${articles.length} articles`);

        //
        // STEP 3: Data Preparation
        // Create numbered titles for analysis
        //
        const numberedTitles = createNumberedTitlesString(articles);
        if (!numberedTitles) {
            throw new Error("Failed to create numbered titles");
        }

        //
        // STEP 4: Analysis
        // Process articles with OpenAI and sort results
        //
        logger.info("Analyzing articles...");
        const analysis = await analyzeNewsWithGPT(articles, myPrompt, OPENAI_API_KEY);
        if (!analysis.results || analysis.results.length === 0) {
            throw new Error("Analysis failed or returned no results");
        }
        
        const sortedAnalysis = sortAnalysisByMatches(analysis);
        logger.success(`Analyzed ${sortedAnalysis.results.length} articles`);

        //
        // STEP 5: Persistence
        // Store both raw articles and analysis results
        //
        logger.info("Storing analysis...");
        await saveAnnotatedNews(sortedAnalysis);
        await saveHeadlines(articles);
        logger.success("Analysis stored");

        //
        // STEP 5.5: Citations
        // Initialize and store all citations
        //
        logger.info("Processing citations...");
        const citationsDbPath = path.join(__dirname, "../../../citations.db");
        await initCitationsDb(citationsDbPath);
        await insertCitations(citationsDbPath, ALL_CITATIONS);
        
        const citationsJson = await generateCitationsJson(citationsDbPath);
        logger.success("All citations processed");

        //
        // STEP 6: Presentation with Citations
        // Generate markdown output including citations
        //
        logger.info("Rendering analysis with citations...");
        await writeMarkdownFile(mergeArticlesWithAnalysis(articles, sortedAnalysis, citationsJson));
        logger.success("Analysis rendered");

    } catch (error) {
        //
        // STEP 7: Error Handling
        // Provide detailed error information and exit gracefully
        //
        if (error instanceof Error) {
            logger.error(`Operation failed`, error);
        } else {
            logger.error("Unknown error occurred", new Error(String(error)));
        }
        process.exit(1);
    }
}

main().catch(console.error);