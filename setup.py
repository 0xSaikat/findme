from setuptools import setup, find_packages

# Load long description from README.md safely
try:
    with open("README.md", "r", encoding="utf-8") as fh:
        long_description = fh.read()
except FileNotFoundError:
    long_description = "A tool to search for usernames across various platforms."

setup(
    name="findme-hackbit",
    version="1.0.5",
    packages=find_packages(),
    include_package_data=True,
    entry_points={
        "console_scripts": [
            "findme-hackbit=findme_hackbit:main",  # Ensure this matches your main module function
        ],
    },
    install_requires=[
        "requests", 
        "colorama", 
        "jsonschema", 
        "termcolor"
    ],
    author="0xSaikat",
    author_email="saikat@hackbit.org",
    description="A tool to search for usernames across various platforms.",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/0xSaikat/findme",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Topic :: Security",
    ],
    keywords="cybersecurity, username search, hackbit",
    python_requires='>=3.6',
)
