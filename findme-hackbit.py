import json
import requests
from jsonschema import validate, ValidationError
from concurrent.futures import ThreadPoolExecutor, as_completed
from termcolor import colored

def load_targets(json_file, schema_file):
    """Load and validate the target platforms from a JSON file."""
    with open(json_file, 'r') as file:
        data = json.load(file)

    
    with open(schema_file, 'r') as schema:
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


def search_username_concurrently(username, platforms, max_threads=10):
    """Search for a username across multiple platforms using threading."""
    results = []
    with ThreadPoolExecutor(max_threads) as executor:
        future_to_platform = {
            executor.submit(check_username, platform, username): name
            for name, platform in platforms.items()
            if not name.startswith("$")  
        }
        for future in as_completed(future_to_platform):
            platform_name = future_to_platform[future]
            try:
                result = future.result()
                if result:
                    results.append((platform_name, result))
            except Exception:
                pass
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


    results = search_username_concurrently(username, platforms)
    if results:
        for platform_name, url in results:
            print(f"{colored('[', 'green')}{colored('+', 'red')}{colored(']', 'green')} {colored(platform_name, 'green', attrs=['bold'])}: {url}")

    else:
        print(colored("[-] No accounts found.", "red", attrs=["bold"]))

    print("\n" + colored("[", "green") + colored("*", "red") + colored("]", "green") + " " + colored("Search completed.", "green", attrs=["bold"]))



if __name__ == "__main__":
    main()
