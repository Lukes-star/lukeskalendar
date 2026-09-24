# lukes32323232

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-cnnbupgl)

## Deljenje termina izmedju uredjaja

Aplikacija koristi lokalnu bazu ako Supabase nije konfigurisan. Za zajednicke termine na telefonu i drugim racunarima:

1. Pokreni obe migracije iz `supabase/migrations` u istom Supabase projektu.
2. Kopiraj `.env.example` u `.env` i upisi Supabase Project URL i anon key.
3. Na Netlify-u iste vrednosti dodaj kao `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`, pa ponovo deployuj sajt.

Telefon klijenta je opcionalan; ime je dovoljno da se termin sacuva.
