# ResearchForge — User Manual

> **Your private, zero-cost AI research assistant running directly on your computer.**

---

## Table of Contents

1. [What is ResearchForge?](#1-what-is-researchforge)
2. [How to Start the App (1 Step)](#2-how-to-start-the-app-1-step)
3. [Mode 1: Quick & Deep Research Reports](#3-mode-1-quick--deep-research-reports)
4. [Mode 2: Academic Research Paper Studio](#4-mode-2-academic-research-paper-studio)
5. [How to Edit and Improve Your Paper](#5-how-to-edit-and-improve-your-paper)
6. [Downloading Your Work (PDF, Word, Markdown)](#6-downloading-your-work-pdf-word-markdown)
7. [Analyzing Your Own Documents (PDFs & Docs)](#7-analyzing-your-own-documents-pdfs--docs)
8. [Simple Troubleshooting](#8-simple-troubleshooting)

---

## 1. What is ResearchForge?

ResearchForge is an AI-powered research assistant that runs **100% locally on your computer**. 

- **Completely Private:** Your searches, documents, and research never leave your computer.
- **Zero Cost ($0):** It uses free local AI (Ollama). No subscriptions, no API keys, no credit cards required.
- **Real Sources:** Instead of making things up, ResearchForge searches academic libraries (like CrossRef) and verified web sources.
- **Checks Facts:** An AI fact-checker verifies evidence before preparing your final report.

---

## 2. How to Start the App (1 Step)

### On Mac:
Simply **double-click** the file named:
```bash
Launch_ResearchForge.command
```
*(Or open your Terminal and run `./run.sh`)*

### On Linux:
Open Terminal in the project folder and run:
```bash
./run.sh
```

### What happens next?
1. The script automatically checks Ollama, the backend, and the frontend.
2. It launches both servers.
3. Your web browser will automatically open to:
   👉 **http://localhost:3000**

To stop ResearchForge at any time, press **`Ctrl + C`** in your Terminal window.

---

## 3. Mode 1: Quick & Deep Research Reports

Use this mode when you want to quickly learn about a topic, check facts, and get a clean research summary.

### Step-by-Step:

1. **Enter Your Topic:**
   On the Home page, type your question or topic into the large search box (for example: *"Solid-state batteries vs lithium-ion for electric cars"*).
   - *Tip: You can also click any of the "Sample topics" below the search box.*

2. **Choose Your Research Depth:**
   - **Quick Research (Zap icon):** Discovers 5–8 sources quickly. Best for quick overviews.
   - **Deep Research (Book icon):** Discovers 10–20 sources, runs comprehensive fact-checking, and cross-examines conflicting claims.

3. **Click "Start Research":**
   Sit back and watch the agents work through 3 simple steps:
   - **Step 1 — Finding Sources:** Collects relevant peer-reviewed studies and articles.
   - **Step 2 — Checking Facts:** Verifies claims and highlights any conflicting evidence.
   - **Step 3 — Preparing Report:** Writes a structured, multi-section summary.

4. **Review Your Results:**
   Once finished, you will see:
   - **Summary:** The main takeaways and answers to your question.
   - **Key Findings:** Specific facts backed by sources.
   - **Fact Check & Conflicts:** Points where different sources disagree.
   - **Sources:** Clickable links to all reference articles.

5. **Download Your Report:**
   Click the **Download PDF** button at the top right to save a clean, formatted report directly to your computer.

---

## 4. Mode 2: Academic Research Paper Studio

Use this mode when you need a **complete academic research paper** for university, college, publication, or in-depth technical analysis.

### How to Open Paper Studio:
In the left sidebar menu, click **Research Paper Studio** (under *Advanced Tools*).

### Step-by-Step Workflow:

1. **Configure Your Paper:**
   - **Title:** Enter your research paper title.
   - **Field of Study:** Select your domain (Computer Science, Medicine, Economics, Physics, etc.).
   - **Paper Typology:** Choose the format (Literature Review, Systematic Review, Survey Paper, Technical Paper, or General Academic Paper).
   - **Citation Style:** Pick your citation format:
     - **APA 7** *(Social Sciences, Psychology, Education)*
     - **IEEE** *(Engineering, Computer Science — uses `[1]`, `[2]`)*
     - **MLA 9** *(Humanities, Literature)*
     - **Chicago** *(History, Business)*
     - **Harvard** or **Vancouver** *(Biomedical)*
   - **Target Word Count:** Select how long you want your paper to be (e.g. 2,500 words, 5,000 words, or 8,000 words).

2. **Generate the Research Plan:**
   Click **"Formulate Research Plan"**. The AI creates a scholarly outline, research questions, and search keywords. You can review or tweak this plan.

3. **Collect & Verify Evidence:**
   Click **"Approve Plan & Discover Sources"**. ResearchForge searches academic registries (CrossRef and web sources) and verifies the credibility of each paper.

4. **Draft the Paper (Section-by-Section):**
   Click **"Draft Complete Paper"**.
   - ResearchForge writes each section separately (Abstract, Introduction, Background, Literature Review, Methodology, Discussion, Limitations, Conclusion, References).
   - Each section writes in real-time — you can read completed sections while the rest are still generating!
   - Every claim is cited with numbered references (`[1]`, `[2]`).

---

## 5. How to Edit and Improve Your Paper

Once your paper is generated, you enter the **Paper Editor**:

- **Section Navigator (Left Bar):** Click on any section (e.g. *Introduction* or *Discussion*) to jump straight to it.
- **Live Word Counter:** Shows how many words each section has and your total progress toward your target word count.
- **Edit Anything:** Simply click into the text box and edit sentences directly. Your changes save automatically.
- **AI Section Tools:**
  - **Regenerate:** Don't like a section? Click the circular arrow icon next to the section title to have the AI write a fresh draft.
  - **Improve Clarity:** Rewrites the current section with sharper academic flow.
  - **Expand:** Adds deeper theoretical context and detailed explanations.
  - **Shorten:** Condenses the section to be concise and punchy.
- **Originality & Citation Audit:** Click **"Originality Audit"** at the top. The system will scan every paragraph to ensure proper attribution and flag any sentences that need a reference.

---

## 6. Downloading Your Work (PDF, Word, Markdown)

When you are ready to use your research paper, click the orange **Export** button at the top right of the Paper Editor.

You can download your paper in three formats:

| Format | Best For | What it includes |
|---|---|---|
| **Academic PDF (.pdf)** | Printing, submitting, or reading | Formal title page, running headers and footers, page numbers, clean academic typography, hyperlinked citations, and complete bibliography. |
| **Word Document (.docx)** | Further editing in Microsoft Word or Google Docs | Standard academic heading styles, editable tables, title cover, and formatted references. |
| **Markdown (.md)** | Storing in Obsidian, Notion, or GitHub | Structured plain text with Markdown headings and citation tags. |

---

## 7. Analyzing Your Own Documents (PDFs & Docs)

Have a research paper, contract, or textbook chapter on your computer? You can research it directly:

1. Click **Documents** in the left sidebar menu (or select **Document Research** on the Home page).
2. Drag and drop your `.pdf`, `.docx`, or `.txt` file into the upload box.
3. Click **"Analyze Document"**.
4. ResearchForge will read the text, extract key arguments, check facts, and write a comprehensive analysis report.

---

## 8. Simple Troubleshooting

### Issue 1: The app says "Local AI: Connecting..." or doesn't start
- **Cause:** Ollama is not running in the background.
- **Fix:** Open your Applications folder and launch **Ollama**, or open Terminal and type:
  ```bash
  ollama serve
  ```
  Then refresh the browser.

### Issue 2: It says model `qwen3.5:latest` is missing
- **Fix:** Open Terminal and download the model (it only needs to download once):
  ```bash
  ollama pull qwen3.5:latest
  ```

### Issue 3: Generation feels slow
- **Explanation:** ResearchForge runs completely on your computer's local hardware without sending anything to the cloud. On Apple Silicon Macs (M1/M2/M3/M4), section generation typically takes 15–30 seconds per section.
- **Tip:** For faster drafting, select **2,500 words** or **Quick Research** mode.

### Issue 4: How do I stop the servers?
- Click into the Terminal window where you launched the script and press **`Ctrl + C`**. Both the frontend and backend servers will shut down cleanly.

---

## Summary of Useful Links

- **Web Interface:** [http://localhost:3000](http://localhost:3000)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **System Health:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

