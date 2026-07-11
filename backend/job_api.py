import requests

def fetch_jobs(query, num_pages=1, api_key=None):
    """
    Fetches remote job listings from the free Remotive API based on the query.
    Bypasses the broken RapidAPI endpoint for a smoother user experience.
    """
    url = f"https://remotive.com/api/remote-jobs?search={query}&limit=12"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        all_jobs = []
        for job in data.get("jobs", [])[:12]:
            all_jobs.append({
                "job_title": job.get("title", "Unknown Title"),
                "employer_name": job.get("company_name", "Unknown Company"),
                "job_city": job.get("candidate_required_location", "Remote"),
                "job_country": "",
                "job_employment_type": job.get("job_type", "Full-time").replace("_", " ").title(),
                "job_apply_link": job.get("url", "#")
            })
            
        return all_jobs

    except Exception as e:
        print(f"Error fetching jobs: {e}")
        return []
