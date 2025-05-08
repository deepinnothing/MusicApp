__Na co zwrócić uwagę:__
- Endpointy dotyczące logowania, rejestracji, wyświetlania utworów i albumów na "głównej" stronie są dostępne bez autoryzacji.
- Endpointy do zarządzania własną biblioteką są dostępne wyłącznie zalogowanym użytkownikom przez JWT
- Endpointy do zarządzania ogólną bazą utworów i albumów są dostępne wyłącznie zalogowanym użytkownikom przez JWT z rolą admina
- UserController posiada specjalny endpoint do nadawania innym użytkownikom roli admina (po email), ponieważ z automatu adminem zostaje tylko pierwszy zarejestrowany użytkownik
- Chociaż utwory są przechowywane w osobnej kolekcji, jednak nie można nimi bezpośrednio zarządzać. To jest możliwe tylko przez zarządzanie albumem
- Utwory istnieją tylko w ramach albumu: przy dodaniu albumu są dodawane utwory w nim zawarte, przy modyfikacji albumu są zarazem modyfikowane/dodawane/usuwane utwory, przy usunięciu albumu są usuwane wszystkie związane z nim utwory
- Niektóre właściwości obiektów są używane sytuacyjnie (np. tylko w procesie komunikacji z bazą danych)

__Postęp:__

✅ Back-end dla wszystkich metod CRUD dla jednej encji w architekturze REST - __1pkt__ - jest zrobione dla encji Album

✅ Zastosowanie realnej bazy danych, np. MsSQL - __1pkt__ - jest zastosowana MongoDB

🆘 Osobna aplikacja Front-endowa wykorzystująca wszystkie funkcje CRUD dla API - __1pkt__

⚠️ Obsługa błędów try-catch wraz ze zwracaniem odpowiedzi (kod i komunikat) - __0.5pkt__ - w sumie try-catch jest już zastosowany, chyba powinno wystarczyć po prostu dodać porządne komunikaty

❓ Przesyłanie/pobieranie danych binarnych (dokumenty) - __0.5pkt__ - można dodać możliwość opcjonalnego przesłania/pobrania plików MP3, aczkolwiek nie jestem pewien, jak to zrobić, mam nadzieje, że to pojawi się na zajęciach

☠️ Inne niewymienione (np. Pełna autentyfikacja, Implementacja kolejekowania w RabbitMQ) - od __0pkt__ do __1pkt__ - autentyfikacja chyba jest już zrobiona (bo nie do końca rozumiem, co znaczy "Pełna"), a RabbitMQ mi nie działał normalnie (no i w ogóle nie do końca zrozumiałem o co w nim chodzi i nie podoba mi się pomysł instalowania dodatkowych rzeczy, które do tego jeszcze nie zawsze działaja)

Frontend najlepiej dodać w jakimś podkatalogu, np. MusicAppReact, aby mieć wszystko w jednym miejscu
