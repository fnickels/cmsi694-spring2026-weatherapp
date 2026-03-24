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
        - text: Tokyo
      - button "Searching..." [disabled] [ref=e11]
    - button "Locating..." [disabled] [ref=e13]
  - status [ref=e14]:
    - paragraph [ref=e16]: Loading weather data...
  - generic "Select a location" [ref=e17]:
    - heading "Choose a location" [level=2] [ref=e18]
    - listbox [ref=e19]:
      - listitem [ref=e20]:
        - button "Tokyo, JP" [ref=e21] [cursor=pointer]
      - listitem [ref=e22]:
        - button "Chofu, JP" [ref=e23] [cursor=pointer]
      - listitem [ref=e24]:
        - button "Tama, JP" [ref=e25] [cursor=pointer]
      - listitem [ref=e26]:
        - button "Kodaira, JP" [ref=e27] [cursor=pointer]
      - listitem [ref=e28]:
        - button "Kokubunji, JP" [ref=e29] [cursor=pointer]
```