__Na co zwrócić uwagę (API):__
- Endpointy dotyczące logowania, rejestracji, wyświetlania utworów i albumów na "głównej" stronie są dostępne bez autoryzacji.
- Endpointy do zarządzania własną biblioteką są dostępne wyłącznie zalogowanym użytkownikom przez JWT
- Endpointy do zarządzania ogólną bazą utworów i albumów są dostępne wyłącznie zalogowanym użytkownikom przez JWT z rolą admina
- UserController posiada specjalny endpoint do nadawania innym użytkownikom roli admina (po email), ponieważ z automatu adminem zostaje tylko pierwszy zarejestrowany użytkownik
- Chociaż utwory są przechowywane w osobnej kolekcji, jednak nie można nimi bezpośrednio zarządzać. To jest możliwe tylko przez zarządzanie albumem
- Utwory istnieją tylko w ramach albumu: przy dodaniu albumu są dodawane utwory w nim zawarte, przy modyfikacji albumu są zarazem modyfikowane/dodawane/usuwane utwory, przy usunięciu albumu są usuwane wszystkie związane z nim utwory
- Modyfikacja albumu następuje przez jego całkowite zastąpienie
- Niektóre właściwości obiektów są używane sytuacyjnie (np. tylko w procesie komunikacji z bazą danych)
- ID są generowane automatycznie przez MongoDB w czasie dodawania obiektów do bazy danych
- Przesyłanie/pobieranie plików FLAC jest możliwe tylko przy wiadomych ID utworów

__Postęp (Programowanie Aplikacji Rozproszonych):__
- ✅ Back-end dla wszystkich metod CRUD dla jednej encji w architekturze REST - __1pkt__ - jest zrobione dla encji Album
- ✅ Zastosowanie realnej bazy danych, np. MsSQL - __1pkt__ - jest zastosowana MongoDB
- 🆘 Osobna aplikacja Front-endowa wykorzystująca wszystkie funkcje CRUD dla API - __1pkt__
- ✅ Obsługa błędów try-catch wraz ze zwracaniem odpowiedzi (kod i komunikat) - __0.5pkt__ - chyba zrobione
- ✅ Przesyłanie/pobieranie danych binarnych (dokumenty) - __0.5pkt__ - dodałem możliwość przeysłania i pobierania plików FLAC
- ☠️ Inne niewymienione (np. Pełna autentyfikacja, Implementacja kolejekowania w RabbitMQ) - od __0pkt__ do __1pkt__ - autentyfikacja chyba jest już zrobiona (bo nie do końca rozumiem, co znaczy "Pełna"), dodałem też RabbitMQ zgodnie z tym, co było na zajęciach, ale nie mogę sprawdzić, czy działa

Frontend najlepiej dodać w jakimś podkatalogu, np. MusicAppReact, aby mieć wszystko w jednym miejscu

W bazie danych już znajdują się niektóre dane (ale użytkowników na razie nie ma żadnych), jednak prosiłbym póki co niczego stamtąd nie usuwać, bo ręczne wpisywanie wszystkiego zajeło mi trochę czasu :)
