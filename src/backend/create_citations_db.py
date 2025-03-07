import sqlite3

# Create a connection to the SQLite database
conn = sqlite3.connect('../../../news.db')
cursor = conn.cursor()

# Create the table
cursor.execute('''
CREATE TABLE IF NOT EXISTS democracy_watch (
    source TEXT,
    author TEXT,
    step TEXT,
    criteria TEXT,
    relevant_link TEXT
)
''')

# Data to be inserted
data = [
    ("7 Steps from Democracy to Dictatorship", "Ece Temelkuran", "1. Rise of Populist Movements", "Watch for political figures claiming to be the sole voice of \"the people\" while demonizing opposition", "https://www.journalofdemocracy.org/articles/the-rise-of-populism-and-the-threat-to-democracy/"),
    ("7 Steps from Democracy to Dictatorship", "Ece Temelkuran", "2. Attacks on Rational Debate & Truth", "Monitor disinformation campaigns, attacks on the free press, and efforts to delegitimize experts", "https://www.brookings.edu/articles/the-rise-of-political-lying-and-what-to-do-about-it/"),
    ("7 Steps from Democracy to Dictatorship", "Ece Temelkuran", "3. Erosion of Political Ethics", "Identify corruption scandals that are downplayed or normalized", "https://www.transparency.org/en/news/cpi-2022-global-highlights"),
    ("7 Steps from Democracy to Dictatorship", "Ece Temelkuran", "4. Undermining of Democratic Institutions", "Watch for attacks on independent courts, election commissions, and watchdog organizations", "https://freedomhouse.org/report/freedom-world/2024/democracy-under-siege"),
    ("7 Steps from Democracy to Dictatorship", "Ece Temelkuran", "5. Redefinition of Citizenship & Suppression of Dissent", "Be alert to new laws restricting voting rights or increased targeting of minorities", "https://www.hrw.org/world-report/2024/country-chapters/global-0"),
    ("7 Steps from Democracy to Dictatorship", "Ece Temelkuran", "6. Breakdown of the Rule of Law", "Investigate news on leaders ignoring legal checks and balances", "https://worldjusticeproject.org/rule-of-law-index/"),
    ("7 Steps from Democracy to Dictatorship", "Ece Temelkuran", "7. Moves Toward One-Party Rule & Power Consolidation", "Look for efforts to silence opposition parties or manipulate elections", "https://www.v-dem.net/publications/democracy-reports/"),
    ("Nazis Rise to Power", "Historical Analysis", "1. Exploiting Economic & Social Turmoil", "Watch for leaders blaming economic hardships on specific groups", "https://encyclopedia.ushmm.org/content/en/article/the-nazi-rise-to-power"),
    ("Nazis Rise to Power", "Historical Analysis", "2. Attempts to Overthrow or Undermine Democratic Institutions", "Be alert to violent or unconstitutional attempts to seize power", "https://www.cambridge.org/core/journals/american-political-science-review/article/how-democracies-die/AC745271E5CC8E9D9D7F4CBFCAD3F8A4"),
    ("Nazis Rise to Power", "Historical Analysis", "3. Manipulation of Public Opinion Through Propaganda", "Identify coordinated disinformation campaigns", "https://www.bbc.com/future/article/20231130-how-propaganda-works-and-how-to-resist-it"),
    ("Nazis Rise to Power", "Historical Analysis", "4. Gradual Erosion of Civil Liberties & Legal Frameworks", "Monitor laws restricting freedom of speech, press, protest, or political organization", "https://www.aclu.org/news/civil-liberties/what-to-do-when-the-government-tries-to-restrict-your-rights"),
    ("Nazis Rise to Power", "Historical Analysis", "5. Rise of One-Party Rule & Elimination of Political Opponents", "Watch for efforts to weaken or dismantle political opposition", "https://www.foreignaffairs.com/articles/2018-04-16/how-democracies-fall-apart"),
    ("Nazis Rise to Power", "Historical Analysis", "6. Use of Violence, Intimidation, and Fear", "Follow incidents of political violence", "https://www.un.org/en/chronicle/article/political-violence-threat-democracy"),
    ("Nazis Rise to Power", "Historical Analysis", "7. Consolidation of Absolute Power", "Be vigilant of leaders merging government branches or abolishing term limits", "https://www.economist.com/leaders/2024/01/04/the-world-in-2024-democracy-v-autocracy"),
    ("Dictator's Handbook", "Bruce Bueno de Mesquita and Alastair Smith", "1. Leaders Prioritizing Power Over Public Welfare", "Watch for leaders prioritizing personal survival over national interests", "https://www.jstor.org/stable/j.ctt7s47v"),
    ("Dictator's Handbook", "Bruce Bueno de Mesquita and Alastair Smith", "2. Shrinking the Ruling Coalition to Stay in Power", "Monitor voter suppression efforts", "https://www.cambridge.org/core/journals/perspectives-on-politics/article/abs/democratic-backsliding/1E9B7320FE2E7E8C2A090658F8C05730"),
    ("Dictator's Handbook", "Bruce Bueno de Mesquita and Alastair Smith", "3. Increased Corruption and Patronage", "Be cautious of government contracts directed to loyalists", "https://www.transparency.org/en/news/how-corruption-weakens-democracy"),
    ("Dictator's Handbook", "Bruce Bueno de Mesquita and Alastair Smith", "4. Attacks on Democratic Institutions and the Free Press", "Follow efforts to weaken institutions like election commissions or courts", "https://rsf.org/en/index"),
    ("Dictator's Handbook", "Bruce Bueno de Mesquita and Alastair Smith", "5. Economic Growth Benefiting Only the Ruling Class", "Scrutinize economic policies that concentrate wealth among political elites", "https://www.imf.org/en/Publications/fandd/issues/2024/03/inequality-and-democracy-ostry"),
    ("Dictator's Handbook", "Bruce Bueno de Mesquita and Alastair Smith", "6. Political Opponents and Critics Being Targeted", "Look for signs of increasing political repression", "https://www.amnesty.org/en/latest/news/2024/01/global-assault-on-human-rights-defenders-intensifies/"),
    ("Dictator's Handbook", "Bruce Bueno de Mesquita and Alastair Smith", "7. Signs of Elites Turning Against the Leader", "(No specific link available in the search results)", "N/A")
]

# Insert the data
cursor.executemany('''
INSERT INTO democracy_watch (source, author, step, criteria, relevant_link)
VALUES (?, ?, ?, ?, ?)
''', data)

# Commit the changes and close the connection
conn.commit()
conn.close()

print("Table created and populated successfully.")
