#!/usr/bin/env python3
"""
LinkedIn Profile Scraper for PortfolioAI

This script scrapes LinkedIn profiles and extracts structured information
including personal details, work experience, education, and skills.
"""

import os
import sys
import json
import argparse
import re
from datetime import datetime
import time
import random

# For web scraping
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException, NoSuchElementException
except ImportError:
    print("Please install selenium: pip install selenium")
    sys.exit(1)

class LinkedInScraper:
    """Scrape LinkedIn profiles and extract structured information."""
    
    def __init__(self, headless=True):
        """Initialize the LinkedIn scraper."""
        self.headless = headless
        self.driver = None
        
    def _setup_driver(self):
        """Set up the Selenium WebDriver."""
        options = Options()
        if self.headless:
            options.add_argument("--headless")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1920,1080")
        options.add_argument("--disable-notifications")
        options.add_argument("--disable-infobars")
        options.add_argument("--disable-extensions")
        options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36")
        
        try:
            self.driver = webdriver.Chrome(options=options)
        except Exception as e:
            print(f"Error setting up Chrome WebDriver: {e}")
            print("Make sure you have Chrome and ChromeDriver installed.")
            sys.exit(1)
    
    def _login_to_linkedin(self, email, password):
        """Log in to LinkedIn with the provided credentials."""
        try:
            self.driver.get("https://www.linkedin.com/login")
            
            # Wait for the login page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            
            # Enter email and password
            self.driver.find_element(By.ID, "username").send_keys(email)
            self.driver.find_element(By.ID, "password").send_keys(password)
            
            # Click the login button
            self.driver.find_element(By.XPATH, "//button[@type='submit']").click()
            
            # Wait for login to complete
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "global-nav"))
            )
            
            print("Successfully logged in to LinkedIn")
            return True
        except Exception as e:
            print(f"Error logging in to LinkedIn: {e}")
            return False
    
    def _extract_profile_info(self):
        """Extract basic profile information."""
        try:
            # Wait for the profile page to load
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "pv-top-card"))
            )
            
            # Extract name
            name_element = self.driver.find_element(By.XPATH, "//h1[@class='text-heading-xlarge inline t-24 v-align-middle break-words']")
            name = name_element.text.strip()
            
            # Extract headline
            headline_element = self.driver.find_element(By.XPATH, "//div[@class='text-body-medium break-words']")
            headline = headline_element.text.strip()
            
            # Extract location
            location_element = self.driver.find_element(By.XPATH, "//span[@class='text-body-small inline t-black--light break-words']")
            location = location_element.text.strip()
            
            # Extract about section
            about = ""
            try:
                about_section = self.driver.find_element(By.XPATH, "//section[@class='pv-about-section']")
                about_element = about_section.find_element(By.XPATH, ".//div[@class='pv-shared-text-with-see-more full-width t-14 t-normal t-black display-flex align-items-center']")
                about = about_element.text.strip()
            except NoSuchElementException:
                pass  # About section might not exist
            
            return {
                "fullName": name,
                "headline": headline,
                "location": location,
                "about": about
            }
        except Exception as e:
            print(f"Error extracting profile info: {e}")
            return {
                "fullName": "",
                "headline": "",
                "location": "",
                "about": ""
            }
    
    def _extract_experience(self):
        """Extract work experience information."""
        experience = []
        
        try:
            # Scroll to the experience section
            self.driver.execute_script("window.scrollTo(0, 1000)")
            time.sleep(2)  # Allow time for the page to load
            
            # Find the experience section
            experience_section = self.driver.find_element(By.ID, "experience-section")
            
            # Find all experience items
            experience_items = experience_section.find_elements(By.XPATH, ".//li[@class='pv-entity__position-group-pager pv-profile-section__list-item ember-view']")
            
            for item in experience_items:
                # Extract job title
                title_element = item.find_element(By.XPATH, ".//h3[@class='t-16 t-black t-bold']")
                title = title_element.text.strip()
                
                # Extract company name
                company_element = item.find_element(By.XPATH, ".//p[@class='pv-entity__secondary-title t-14 t-black t-normal']")
                company = company_element.text.strip()
                
                # Extract dates
                date_element = item.find_element(By.XPATH, ".//h4[@class='pv-entity__date-range t-14 t-black--light t-normal']/span[2]")
                date_range = date_element.text.strip()
                
                # Parse date range
                start_date = ""
                end_date = None  # None indicates current position
                
                if " – " in date_range:
                    dates = date_range.split(" – ")
                    start_date_str = dates[0].strip()
                    end_date_str = dates[1].strip()
                    
                    # Parse start date
                    if re.match(r"[A-Za-z]+ \d{4}", start_date_str):
                        month, year = start_date_str.split()
                        month_num = {"Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06", 
                                    "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"}.get(month[:3], "01")
                        start_date = f"{year}-{month_num}"
                    
                    # Parse end date
                    if end_date_str.lower() != "present":
                        if re.match(r"[A-Za-z]+ \d{4}", end_date_str):
                            month, year = end_date_str.split()
                            month_num = {"Jan": "01", "Feb": "02", "Mar": "03", "Apr": "04", "May": "05", "Jun": "06", 
                                        "Jul": "07", "Aug": "08", "Sep": "09", "Oct": "10", "Nov": "11", "Dec": "12"}.get(month[:3], "01")
                            end_date = f"{year}-{month_num}"
                
                # Extract description
                description = ""
                try:
                    description_element = item.find_element(By.XPATH, ".//div[@class='pv-entity__description t-14 t-normal t-black']")
                    description = description_element.text.strip()
                except NoSuchElementException:
                    pass  # Description might not exist
                
                experience.append({
                    "title": title,
                    "company": company,
                    "startDate": start_date,
                    "endDate": end_date,
                    "description": description
                })
            
            return experience
        except Exception as e:
            print(f"Error extracting experience: {e}")
            return []
    
    def _extract_education(self):
        """Extract education information."""
        education = []
        
        try:
            # Scroll to the education section
            self.driver.execute_script("window.scrollTo(0, 1500)")
            time.sleep(2)  # Allow time for the page to load
            
            # Find the education section
            education_section = self.driver.find_element(By.ID, "education-section")
            
            # Find all education items
            education_items = education_section.find_elements(By.XPATH, ".//li[@class='pv-education-entity pv-profile-section__list-item ember-view']")
            
            for item in education_items:
                # Extract institution name
                institution_element = item.find_element(By.XPATH, ".//h3[@class='pv-entity__school-name t-16 t-black t-bold']")
                institution = institution_element.text.strip()
                
                # Extract degree
                degree = ""
                try:
                    degree_element = item.find_element(By.XPATH, ".//p[@class='pv-entity__degree-name t-14 t-black t-normal']/span[2]")
                    degree = degree_element.text.strip()
                except NoSuchElementException:
                    pass  # Degree might not exist
                
                # Extract dates
                start_date = ""
                end_date = ""
                try:
                    date_element = item.find_element(By.XPATH, ".//p[@class='pv-entity__dates t-14 t-black--light t-normal']/span[2]")
                    date_range = date_element.text.strip()
                    
                    if " – " in date_range:
                        dates = date_range.split(" – ")
                        start_year = dates[0].strip()
                        end_year = dates[1].strip()
                        
                        start_date = f"{start_year}-01"  # Default to January
                        end_date = f"{end_year}-01" if end_year.lower() != "present" else None
                except NoSuchElementException:
                    pass  # Dates might not exist
                
                education.append({
                    "institution": institution,
                    "degree": degree,
                    "startDate": start_date,
                    "endDate": end_date
                })
            
            return education
        except Exception as e:
            print(f"Error extracting education: {e}")
            return []
    
    def _extract_skills(self):
        """Extract skills information."""
        skills = []
        
        try:
            # Scroll to the skills section
            self.driver.execute_script("window.scrollTo(0, 2000)")
            time.sleep(2)  # Allow time for the page to load
            
            # Click on "Show more skills" button if available
            try:
                show_more_button = self.driver.find_element(By.XPATH, "//button[contains(@class, 'pv-skills-section__additional-skills')]")
                show_more_button.click()
                time.sleep(1)  # Wait for the skills to expand
            except NoSuchElementException:
                pass  # Button might not exist
            
            # Find the skills section
            skills_section = self.driver.find_element(By.ID, "skills-section")
            
            # Find all skill items
            skill_items = skills_section.find_elements(By.XPATH, ".//span[@class='pv-skill-category-entity__name-text t-16 t-black t-bold']")
            
            for item in skill_items:
                skills.append(item.text.strip())
            
            return skills
        except Exception as e:
            print(f"Error extracting skills: {e}")
            return []
    
    def scrape_profile(self, profile_url, email=None, password=None):
        """Scrape a LinkedIn profile and extract structured information."""
        if not self.driver:
            self._setup_driver()
        
        try:
            # If credentials are provided, log in first
            if email and password:
                if not self._login_to_linkedin(email, password):
                    return {"error": "Failed to log in to LinkedIn"}
            
            # Navigate to the profile URL
            self.driver.get(profile_url)
            
            # Wait for the page to load
            time.sleep(random.uniform(3, 5))  # Random delay to avoid detection
            
            # Extract profile information
            profile_info = self._extract_profile_info()
            experience = self._extract_experience()
            education = self._extract_education()
            skills = self._extract_skills()
            
            return {
                "fullName": profile_info["fullName"],
                "headline": profile_info["headline"],
                "location": profile_info["location"],
                "about": profile_info["about"],
                "experience": experience,
                "education": education,
                "skills": skills
            }
        except Exception as e:
            print(f"Error scraping profile: {e}")
            return {"error": f"Failed to scrape profile: {str(e)}"}
        finally:
            if self.driver:
                self.driver.quit()
                self.driver = None

def main():
    parser = argparse.ArgumentParser(description="Scrape LinkedIn profiles")
    parser.add_argument("profile_url", help="URL of the LinkedIn profile to scrape")
    parser.add_argument("--email", help="LinkedIn login email")
    parser.add_argument("--password", help="LinkedIn login password")
    parser.add_argument("--output", "-o", help="Output JSON file path")
    parser.add_argument("--no-headless", action="store_true", help="Run in non-headless mode")
    args = parser.parse_args()
    
    scraper = LinkedInScraper(headless=not args.no_headless)
    result = scraper.scrape_profile(args.profile_url, args.email, args.password)
    
    if args.output:
        with open(args.output, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"Results saved to {args.output}")
    else:
        print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
