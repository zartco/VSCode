# Dashboard

```text
  ___   _   ___ _  _ ___  ___   _   ___  ___ 
 |   \ /_\ / __| || | _ )/ _ \ /_\ | _ \/   \
 | |) / _ \\__ \ __ | _ \ (_) / _ \|   /| D |
 |___/_/ \_\___/_||_|___/\___/_/ \_\_|_\\___/
```

8-week sprint · target final by **Aug 1, 2026**.  → [[00 Study Plan]]

## Active Projects
```dataview
table without id file.link as "Project", status as "Status"
from "Projects"
where status = "active"
sort file.name asc
```

## Needs review
Modules rated **red** or **amber** (set the `confidence` property in any module note):

```dataview
table without id file.link as "Module", status as "Status", confidence as "Confidence"
from "Modules"
where confidence = "red" or confidence = "amber"
sort module asc
```

## All modules
```dataview
table without id file.link as "Module", block as "Block", status as "Status", confidence as "Confidence"
from "Modules"
sort module asc
```

## Due soon
```tasks
not done
sort by due
limit 8
```

## Quick links
[[Start Here]] · [[00 Study Plan]] · [[00 Formula Cheat-Sheet]] · [[Error Log]] · [[Resources]]

---
Confidence key: **red** = shaky · **amber** = okay · **green** = solid. Change it in a module's **confidence** property and this dashboard updates itself.
