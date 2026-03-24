# Page snapshot

```yaml
- generic [ref=e4]:
  - banner [ref=e5]:
    - heading "Current Weather" [level=1] [ref=e6]
    - button "Toggle temperature units" [ref=e7] [cursor=pointer]: °F
  - form "Search weather by location" [ref=e8]:
    - generic [ref=e9]:
      - textbox "Location search" [disabled] [ref=e10]:
        - /placeholder: Search city or town
        - text: Chicago
      - button "Searching..." [disabled] [ref=e11]
    - button "Locating..." [disabled] [ref=e13]
  - status [ref=e14]:
    - paragraph [ref=e16]: Loading weather data...
  - generic "Select a location" [ref=e17]:
    - heading "Choose a location" [level=2] [ref=e18]
    - listbox [ref=e19]:
      - listitem [ref=e20]:
        - button "Chicago, Illinois, US" [ref=e21] [cursor=pointer]
      - listitem [ref=e22]:
        - button "Chicago, Western Cape, ZA" [ref=e23] [cursor=pointer]
      - listitem [ref=e24]:
        - button "Chicago, Midlands Province, ZW" [ref=e25] [cursor=pointer]
      - listitem [ref=e26]:
        - button "Chicago, French Guiana, FR" [ref=e27] [cursor=pointer]
      - listitem [ref=e28]:
        - button "Chicago, La Romana, DO" [ref=e29] [cursor=pointer]
```