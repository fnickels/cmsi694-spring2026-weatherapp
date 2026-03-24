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
        - text: Los Angeles
      - button "Searching..." [disabled] [ref=e11]
    - button "Locating..." [disabled] [ref=e13]
  - status "Location detection notice" [ref=e14]:
    - paragraph [ref=e15]: Location access was denied — try entering a city name below.
  - status [ref=e16]:
    - paragraph [ref=e18]: Loading weather data...
  - generic "Select a location" [ref=e19]:
    - heading "Choose a location" [level=2] [ref=e20]
    - listbox [ref=e21]:
      - listitem [ref=e22]:
        - button "Los Angeles, California, US" [ref=e23] [cursor=pointer]
      - listitem [ref=e24]:
        - button "Los Angeles, Sucre, CO" [ref=e25] [cursor=pointer]
      - listitem [ref=e26]:
        - button "Los Ángeles, Biobío Region, CL" [ref=e27] [cursor=pointer]
      - listitem [ref=e28]:
        - button "Los Angeles, Chiriquí, PA" [ref=e29] [cursor=pointer]
      - listitem [ref=e30]:
        - button "Los Angeles, Risaralda, CO" [ref=e31] [cursor=pointer]
```