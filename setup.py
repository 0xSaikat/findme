from setuptools import setup
import os

try:
    with open("README.md", "r", encoding="utf-8") as fh:
        long_description = fh.read()
except FileNotFoundError:
    long_description = "FindME - Hunt down social media accounts by username across 400+ social networks"

setup(
    name="findme-osint",
    version="1.0.6",  
    py_modules=["findme"],
    include_package_data=True,
    data_files=[
        ('', ['data.json', 'data.schema.json']),
    ],
    entry_points={
        "console_scripts": [
            "findme=findme:main",
        ],
    },
    install_requires=[
        "requests>=2.25.1",
        "jsonschema>=4.0.0",
        "termcolor>=1.1.0",
    ],
    author="Sakil Hasan Saikat (0xSaikat)",
    author_email="saikat@hackbit.org",
    description="Hunt down social media accounts by username across 400+ social networks",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/0xSaikat/findme",
    project_urls={
        "Bug Tracker": "https://github.com/0xSaikat/findme/issues",
        "Source Code": "https://github.com/0xSaikat/findme",
        "Homepage": "https://saikat.hackbit.org",
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Development Status :: 4 - Beta",
        "Intended Audience :: Developers",
        "Intended Audience :: Information Technology",
        "Topic :: Security",
        "Topic :: Internet",
        "Environment :: Console",
    ],
    keywords="osint cybersecurity username-search reconnaissance social-media hackbit findme",
    python_requires='>=3.6',
)
