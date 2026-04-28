import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

old_import = 'import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc, increment, writeBatch, updateDoc } from "firebase/firestore";'
new_import = 'import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc, increment, writeBatch, updateDoc, arrayUnion } from "firebase/firestore";'

content = content.replace(old_import, new_import)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
