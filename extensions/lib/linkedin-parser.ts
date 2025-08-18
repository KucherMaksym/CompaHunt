import {type JobData, type ParseResult, type Salary} from "./types"
import {HtmlProcessor} from "./html-utils"

export class LinkedInJobParser {
    private getCleanText(element: Element | null): string {
        if (!element) return ""
        return element.textContent?.trim() || ""
    }

    private extractSkills(description: string): string[] {

        // TODO: use AI for extracting requirements
        const skillKeywords = [
            // Programming languages
            'javascript', 'typescript', 'python', 'java', 'react', 'node.js',
            'angular', 'vue', 'html', 'css', 'sql', 'mongodb', 'postgresql',
            // Frameworks & tools
            'docker', 'kubernetes', 'aws', 'azure', 'git', 'jenkins', 'jira',
            // Soft skills
            'leadership', 'communication', 'teamwork', 'agile', 'scrum'
        ]

        const foundSkills: string[] = []
        const lowercaseDesc = description.toLowerCase()

        skillKeywords.forEach(skill => {
            if (lowercaseDesc.includes(skill.toLowerCase())) {
                foundSkills.push(skill)
            }
        })

        return [...new Set(foundSkills)] // Remove duplicates
    }

    private extractRequirements(description: string): string[] {
        const requirements: string[] = []

        // Split by common patterns for requirements
        const sections = description.split(/(?:requirements|qualifications|must have|required|responsibilities):/i)

        if (sections.length > 1) {
            const reqSection = sections[1]
            const lines = reqSection.split(/[•\n\r]/).filter(line =>
                line.trim().length > 10 && !line.includes('preferred')
            )

            requirements.push(...lines.map(line => line.trim()).slice(0, 5))
        }

        return requirements
    }

    private extractLocationAndApplicantCount(): { location: string, applicantCount: number } {
        const locationContainer = document.querySelector('.job-details-jobs-unified-top-card__tertiary-description-container')
        if (!locationContainer) return { location: '', applicantCount: 0 }

        // Try to find text that looks like location (there are a few span with the same name)
        const spans = locationContainer.querySelectorAll('span.tvm__text--low-emphasis')

        const data = {
            location: "",
            applicantCount: 0
        };

        for (const span of spans) {
            const text = span.textContent?.trim() || ""

            if (text) {
                if (text.includes("applicants") ||
                    text.includes("clicked apply")) {
                     data.applicantCount = Number(text.match(/\d+/g)?.[0]);
                }

                if (data.location == "" &&
                    !text.includes('ago') &&
                    !text.includes('apply') &&
                    !text.includes('Reposted') &&
                    !text.includes('Promoted') &&
                    !text.includes('Responses') &&
                    text.length > 4) {
                    data.location = text;
                }
            }
        }

        console.log("data", data)
        return data
    }

    private extractJobPreferences(): { remoteness: string, jobType: string } {
        const container = document.querySelector('.job-details-fit-level-preferences')
        if (!container) return { remoteness: '', jobType: ''}

        const buttons = container.querySelectorAll('button')
        let remoteness = ''
        let jobType = ''

        buttons.forEach(button => {
            const text = button.textContent?.trim() || ''

            if (this.looksLikeSalary(text)) {
                return
            }

            if (text.includes('On-site') || text.includes('Remote') || text.includes('Hybrid')) {
                const match = text.match(/(On-Site|Hybrid|Remote)/i)
                remoteness = match ? match[1] : ''
            } else if (text.includes('Full-time') || text.includes('Part-time') || text.includes('Contract')) {
                const match = text.match(/(Full-time|Part-time|Contract|Internship)/i)
                jobType = match ? match[1] : ''
            }
        })

        return { remoteness, jobType }
    }

    public parseJobPage(): ParseResult {
        try {
            // Check if we're on a LinkedIn job page
            if (!window.location.href.includes('linkedin.com/jobs')) {
                console.log("current page: ", window.location.href)
                return {
                    success: false,
                    error: "Not a LinkedIn job page"
                }
            }

            // Main job title
            const titleElement = document.querySelector('h1.t-24.t-bold.inline, h1[data-test-id="job-title"]')
            const title = this.getCleanText(titleElement)

            // Company name
            const companyElement = document.querySelector('.jobs-unified-top-card__company-name a, .job-details-jobs-unified-top-card__company-name a')
            const company = this.getCleanText(companyElement)

            // Location
            const location = this.extractLocationAndApplicantCount().location;
            const applicantCount = this.extractLocationAndApplicantCount().applicantCount;

            // Experience level
            // const experienceLevelElement = document.querySelector('[data-test-id="job-details-job-summary-info-list"] li:contains("level")')
            // const experienceLevel = this.getCleanText(experienceLevelElement)

            // Posted date
            const postedElement = document.querySelector('.jobs-unified-top-card__posted-date, .job-details-jobs-unified-top-card__posted-date')
            const postedDate = this.getCleanText(postedElement)

            // Job description
            const descriptionElement = document.querySelector('#job-details')
            console.log(descriptionElement);
            const description = this.getCleanText(descriptionElement)
            
            // Extract HTML description with formatting
            const htmlDescription = HtmlProcessor.extractLinkedInJobHtml(descriptionElement)

            // Industry (if available)
            const industryElement = document.querySelector('.jobs-unified-top-card__industry')
            const industry = this.getCleanText(industryElement)

            // Salary (if available)
            const salary =  this.extractSalary();
            console.log("salary", salary);

            // Extract skills and requirements
            const skills = this.extractSkills(description)

            // Hard to implement correctly without AI. Maybe later
            // const requirements = this.extractRequirements(description)
            const requirements = [];

            const jobData: JobData = {
                title,
                company,
                location,
                jobType: this.extractJobPreferences().jobType,
                // experienceLevel,
                description,
                htmlDescription,
                requirements,
                skills,
                postedDate,
                applicantCount,
                url: window.location.href,
                salary,
                remoteness: this.extractJobPreferences().remoteness,
                industry,
                manual: false
            }

            // Validate that we have essential data
            if (!title || !company) {
                return {
                    success: false,
                    error: "Could not extract essential job information"
                }
            }

            return {
                success: true,
                data: jobData
            }

        } catch (error) {
            return {
                success: false,
                error: `Parsing failed: ${(error as Error).message}`
            }
        }
    }

    // --- Salary Parser ---
    private extractSalary(): Salary | null {
        // Approach 1: extract from job preferences
        const preferenceSalary = this.extractSalaryFromPreferences()
        if (preferenceSalary) {
            return preferenceSalary
        }

        // Approach 2: (Fallback) extract from description using regex
        const descriptionSalary = this.extractSalaryFromDescription()
        return descriptionSalary
    }

    private extractSalaryFromPreferences(): Salary | null {
        const container = document.querySelector('.job-details-fit-level-preferences')
        if (!container) return null

        const buttons = container.querySelectorAll('button')

        for (const button of buttons) {
            const text = this.getCleanText(button)

            console.log("salary text", text)
            if (this.looksLikeSalary(text)) {
                console.log("looks like salary", text)
                const parsed = this.parseSalaryString(text)
                console.log("parsed", parsed)
                if (parsed) {
                    return {
                        range: text,
                        min: parsed.minAmount,
                        max: parsed.maxAmount,
                        currency: parsed.currency,
                        period: parsed.period,
                        type: 'Preference',
                        location: this.extractLocationAndApplicantCount().location
                    }
                }
            }
        }

        return null
    }

    private extractSalaryFromDescription(): Salary | null {
        const descriptionElement = document.querySelector('#job-details')
        if (!descriptionElement) return null

        const description = this.getCleanText(descriptionElement)

        const salaryPatterns = [
            // $80,000 - $120,000 per year
            /([€$£¥₹₽])\s*([\d,]+)\s*-\s*([€$£¥₹₽])?\s*([\d,]+)\s*per\s*(year|month|hour|annum)/gi,
            // €50K - 80K annually
            /([€$£¥₹₽])\s*([\d,]+)K?\s*-\s*([€$£¥₹₽])?\s*([\d,]+)K?\s*(annually|yearly|per year)/gi,
            // Salary: $75,000/year
            /(?:salary|compensation|pay):\s*([€$£¥₹₽])\s*([\d,]+)(?:K)?\/?(year|yr|month|mo|hour|hr)?/gi,
            // $18/hr - $25/hr
            /([€$£¥₹₽])\s*([\d,]+)\/hr\s*-\s*([€$£¥₹₽])?\s*([\d,]+)\/hr/gi,
            // Up to $100,000 annually
            /up to\s+([€$£¥₹₽])\s*([\d,]+)(?:K)?\s*(annually|yearly|per year)/gi,
            // Starting at €45K
            /starting at\s+([€$£¥₹₽])\s*([\d,]+)K?/gi
        ]

        for (const pattern of salaryPatterns) {
            const matches = [...description.matchAll(pattern)]

            for (const match of matches) {
                const salaryData = this.processSalaryFromDescription(match)
                if (salaryData) {
                    return {
                        range: match[0],
                        min: salaryData.minAmount,
                        max: salaryData.maxAmount,
                        currency: salaryData.currency,
                        period: salaryData.period,
                        type: 'Description',
                        location: this.extractLocationAndApplicantCount().location
                    }
                }
            }
        }
        return null
    }

    private processSalaryFromDescription(match: RegExpMatchArray): {
        currency: string,
        period: string,
        minAmount?: number,
        maxAmount?: number
    } | null {
        if (!match) return null

        const currency = match.find(part => part && /[€$£¥₹₽]/.test(part)) || '$'

        const numbers = match.filter(part => part && /^\d+/.test(part))
        const amounts = numbers.map(num => this.parseAmount(num))

        const periodText = match.find(part =>
            part && /(year|yr|month|mo|hour|hr|annually|yearly|annum)/i.test(part)
        ) || 'year'

        const period = this.normalizePeriod(periodText)

        return {
            currency: currency.replace(/[^\€\$\£\¥\₹\₽]/g, ''),
            period,
            minAmount: amounts[0],
            maxAmount: amounts[1]
        }
    }

    private looksLikeSalary(text: string): boolean {
        const excludePatterns = [
            /from job description/i,
            /retrieved from/i,
            /pay found in/i,
            /see job posting/i,
            /on-site|remote|hybrid/i,
            /full-time|part-time|contract/i
        ]

        if (excludePatterns.some(pattern => pattern.test(text))) {
            return false
        }

        const hasCurrency = /[€$£¥₹₽]/.test(text)
        const hasNumbers = /\d+/.test(text)

        return hasCurrency && hasNumbers
    }


    private parseSalaryString(salaryStr: string): {
        currency: string,
        period: string,
        minAmount?: number,
        maxAmount?: number
    } | null {
        if (!salaryStr) return null

        // Regex for salary parsing
        const patterns = [
            // $155K/yr - $339.5K/yr (with decimals and K included)
            /([€$£¥₹₽])([\d,]+\.?\d*K)\/(\w+)\s*-\s*([€$£¥₹₽])([\d,]+\.?\d*K)\/(\w+)/,
            // $250K/yr - $500K/yr
            /([€$£¥₹₽])([\d,]+K)\/(\w+)\s*-\s*([€$£¥₹₽])([\d,]+K)\/(\w+)/,
            // €80,000/yr - €650,000/yr
            /([€$£¥₹₽])([\d,]+)\/(\w+)\s*-\s*([€$£¥₹₽])([\d,]+)\/(\w+)/,
            // $50,000 - $80,000 per year
            /([€$£¥₹₽])([\d,]+)\s*-\s*([€$£¥₹₽])([\d,]+)\s*per\s*(\w+)/,
            // €80K - €650K annually (with K included)
            /([€$£¥₹₽])([\d,]+\.?\d*K?)\s*-\s*([€$£¥₹₽])([\d,]+\.?\d*K?)\s*(\w+)/,
            // $75K/year (with K included)
            /([€$£¥₹₽])([\d,]+\.?\d*K)\/(\w+)/,
            // $75,000/year
            /([€$£¥₹₽])([\d,]+)\/(\w+)/,
            // €80,000 per year
            /([€$£¥₹₽])([\d,]+)\s*per\s*(\w+)/
        ]

        for (const pattern of patterns) {
            const match = salaryStr.match(pattern)
            if (match) {
                return this.processSalaryMatch(match)
            }
        }

        return null
    }

    private processSalaryMatch(match: RegExpMatchArray): {
        currency: string,
        period: string,
        minAmount?: number,
        maxAmount?: number
    } {
        const [, currency1, amount1, period1, currency2, amount2, period2] = match

        // Currency
        const currency = currency1 || currency2 || '$'

        // Period
        const period = this.normalizePeriod(period1 || period2 || 'year')

        // Convert numbers
        const minAmount = this.parseAmount(amount1)
        const maxAmount = amount2 ? this.parseAmount(amount2) : undefined

        return {
            currency,
            period,
            minAmount,
            maxAmount
        }
    }

    private normalizePeriod(period: string): string {
        const normalized = period.toLowerCase()
        const periodMap: { [key: string]: string } = {
            'yr': 'year',
            'annually': 'year',
            'yearly': 'year',
            'mo': 'month',
            'monthly': 'month',
            'hr': 'hour',
            'hourly': 'hour',
            'weekly': 'week',
            'daily': 'day'
        }

        return periodMap[normalized] || normalized
    }

    private parseAmount(amountStr: string): number {
        // Delete commas and convert K's to thousands
        let cleaned = amountStr.replace(/,/g, '')

        if (cleaned.includes('K')) {
            // Handle cases like "155K" or "339.5K"
            const numberPart = cleaned.replace('K', '')
            const result = parseFloat(numberPart) * 1000
            return result
        }

        const result = parseFloat(cleaned)
        return result
    }
}