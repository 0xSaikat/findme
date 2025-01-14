from setuptools import setup, find_packages

setup(
    name="findme-hackbit.org",
    version="1.0.4",
    packages=find_packages(),
    include_package_data=True,
    entry_points={
        "console_scripts": [
            "findme=findme:main",  # Refers to the main() function in findme.py
        ],
    },
    install_requires=[
        "requests", "colorama", "jsonschema", "termcolor"
    ],
    author="0xSaikat",
    author_email="saikat@hackbit.org",
    description="A tool to search for usernames across various platforms.",
    long_description=open("README.md").read(),
    long_description_content_type="text/markdown",
    url="https://github.com/0xSaikat/findme",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires='>=3.6',
)

