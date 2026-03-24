VioletBot Static No-Database Final
=================================

This version is FULLY STATIC.
No database.
No Netlify functions.
No admin panel.
Upload these files to almost any normal hosting and it will work.

Main files
----------
- index.html
- page.html
- styles.css
- site.js
- page.js
- data/classes.json
- data/pages.json
- images/...

How to update classes
---------------------
Open:
- data/classes.json

Each class has fields like:
- name
- slug
- cardImage
- downloadUrl
- rankTags
- trending
- versionStatus
- updatedAt
- guideText
- guideImages
- lockImages
- addonImages

Examples
--------
Add S+ and T2:
"rankTags": ["S+", "T2"]

Add Trending:
"trending": true

Latest Version:
"versionStatus": "latest"

Older Version:
"versionStatus": "older"

No version badge:
"versionStatus": ""

How to add a new class
----------------------
1. Copy an existing class block in data/classes.json
2. Change the slug, name, tags, text, links
3. Add the class images into:
   - images/classes
   - images/guides
   - images/locks
   - images/addons
4. Put the image paths inside that class object
5. Upload the changed JSON + new image files

How to connect images to the class page
---------------------------------------
Images are connected by being inside the matching class object in classes.json.

Example:
"guideImages": [
  { "title": "1080P UI", "src": "images/guides/ninja-1080p.webp" },
  { "title": "2K UI", "src": "images/guides/ninja-2k.webp" }
]

How to update pages
-------------------
Open:
- data/pages.json

Each page has:
- slug
- title
- navLabel
- status
- heroText
- bodyText
- heroImage
- showInNav
- sortOrder

Example Grind Spots:
{
  "slug": "grind-spots",
  "title": "Grind Spots",
  "navLabel": "Grind Spots",
  "status": "coming-soon",
  "heroText": "Grind Spots",
  "bodyText": "Coming soon.",
  "heroImage": "",
  "showInNav": true,
  "sortOrder": 1
}

Local notes
-----------
User local notes and local uploaded images are stored ONLY in that user's browser.
They are NOT sent anywhere.

Upload workflow
---------------
Normal content update:
- upload changed JSON file
- upload new/changed image files

You do NOT need to upload everything every time.
Only changed files.

Notes
-----
- Keep file names simple: lowercase, dashes, no spaces
- Use .webp or compressed .png/.jpg when possible
- External download links still work


Patched JPG batch:
- Replaced provided addon images from WEBP to JPG for 10 classes
- Replaced gallery card images for Lahn Awakening and Witch Awakening


Final patch:
- New logo kept
- JPG addons wired
- JPG guides wired
- JPG skill locks wired
- Lahn/Witch gallery cards updated
