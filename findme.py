import json
import sys
import os
import requests
from jsonschema import validate, ValidationError
from concurrent.futures import ThreadPoolExecutor, as_completed
from termcolor import colored

def get_data_file_path(filename):
    """Get the path to data files."""
    # Try current directory first
    if os.path.exists(filename):
        return filename
    
    # Try script directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(script_dir, filename)
    if os.path.exists(data_path):
        return data_path
    
    # Try installation directory
    try:
        import site
        for site_dir in site.getsitepackages():
            data_path = os.path.join(site_dir, filename)
            if os.path.exists(data_path):
                return data_path
    except:
        pass
    
    raise FileNotFoundError(f"Cannot find {filename}")


def load_targets(json_file, schema_file):
    """Load and validate the target platforms from a JSON file."""
    try:
        json_path = get_data_file_path(json_file)
        schema_path = get_data_file_path(schema_file)
    except FileNotFoundError as e:
        print(f"Error: {e}")
        print("Make sure data.json and data.schema.json are in the same directory.")
        exit(1)

    with open(json_path, 'r') as file:
        data = json.load(file)

    with open(schema_path, 'r') as schema:
        schema_data = json.load(schema)
        try:
            validate(instance=data, schema=schema_data)
        except ValidationError as e:
            print(f"Schema validation error: {e}")
            exit(1)

    return data


def check_username(platform, username):
    """Check if a username exists on a platform."""
    url = platform["url"].format(username)
    try:
        response = requests.get(url, headers=platform.get("headers", {}), timeout=5)
        if response.status_code in [403, 404]:
            return None  
        if platform["errorType"] == "status_code":
            if response.status_code == 200:
                return url
        elif platform["errorType"] == "message":
            error_msgs = platform["errorMsg"]
            error_msgs = error_msgs if isinstance(error_msgs, list) else [error_msgs]
            for msg in error_msgs:
                if msg in response.text:
                    return None
            return url
    except Exception:
        return None


def search_username_concurrently(username, platforms, max_threads=10, show_progress=True):
    """Search for a username across multiple platforms using threading."""
    results = []
    
    # Filter out metadata keys (starting with $)
    valid_platforms = {name: platform for name, platform in platforms.items() if not name.startswith("$")}
    total_platforms = len(valid_platforms)
    completed = 0
    found_count = 0
    
    if show_progress and total_platforms > 0:
        print(colored(f"Searching across {total_platforms} platforms...\n", "cyan"))
    
    with ThreadPoolExecutor(max_threads) as executor:
        future_to_platform = {
            executor.submit(check_username, platform, username): name
            for name, platform in valid_platforms.items()
        }
        
        for future in as_completed(future_to_platform):
            platform_name = future_to_platform[future]
            completed += 1
            
            try:
                result = future.result()
                if result:
                    results.append((platform_name, result))
                    found_count += 1
                    status_icon = colored('✓', 'green')
                    status_text = colored('FOUND', 'green')
                else:
                    status_icon = colored('○', 'yellow')
                    status_text = colored('NOT FOUND', 'yellow')
            except Exception:
                status_icon = colored('✗', 'red')
                status_text = colored('ERROR', 'red')
            
            if show_progress and total_platforms > 0:
                # Calculate percentage
                percentage = (completed / total_platforms) * 100
                progress_bar_length = 40
                filled = int(progress_bar_length * completed / total_platforms)
                bar = '█' * filled + '░' * (progress_bar_length - filled)
                
                # Update progress line
                progress_line = (
                    f"\r[{bar}] {percentage:.1f}% | "
                    f"{status_icon} {platform_name[:20]:20s} | "
                    f"Completed: {completed}/{total_platforms} | "
                    f"Found: {colored(str(found_count), 'green')}"
                )
                sys.stdout.write(progress_line)
                sys.stdout.flush()
    
    if show_progress and total_platforms > 0:
        # Final progress line
        bar = '█' * 40
        final_line = (
            f"\r[{bar}] 100.0% | "
            f"Completed: {total_platforms}/{total_platforms} | "
            f"Found: {colored(str(found_count), 'green')}/{total_platforms}"
        )
        sys.stdout.write(final_line)
        sys.stdout.flush()
        print("\n")  # New line after progress
    
    return results


def print_banner():
    """Print the banner with styled text."""
    banner = (
        "\033[1;32m"  
        "\n"
        "╭─────[By 0xSaikat]───────────────────────────────────╮\n"
        "│                                                     │\n"
        "│         _______           ____  _________           │\n"
        "│        / ____(_)___  ____/ /  |/  / ____/           │\n"
        "│       / /_  / / __ \\/ __  / /|_/ / __/              │\n"
        "│      / __/ / / / / / /_/ / /  / / /___              │\n"
        "│     /_/   /_/_/ /_/\\__,_/_/  /_/_____/  V-1.0       │\n"
        "│                                                     │\n"
        "╰─────────────────────────────────[hackbit.org]───────╯\n"
        "\033[0m"  
    )
    print(banner)


def main():
    print_banner()
    print()  

    platforms = load_targets("data.json", "data.schema.json")
    username = input(colored("[", "green") + colored("*", "red") + colored("]", "green") + " Enter username to search social account: ")
    print(colored("\n[", "green") + colored("*", "red") + colored("] Checking username ", "green", attrs=["bold"]) + colored(username, "red", attrs=["bold"]) + colored(" on:\n", "green", attrs=["bold"]))

    results = search_username_concurrently(username, platforms, show_progress=True)
    if results:
        for platform_name, url in results:
            print(f"{colored('[', 'green')}{colored('+', 'red')}{colored(']', 'green')} {colored(platform_name, 'green', attrs=['bold'])}: {url}")

    else:
        print(colored("[-] No accounts found.", "red", attrs=["bold"]))

    print("\n" + colored("[", "green") + colored("*", "red") + colored("]", "green") + " " + colored("Search completed.", "green", attrs=["bold"]))



if __name__ == "__main__":
    main() 
