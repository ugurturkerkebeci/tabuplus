# -*- coding: utf-8 -*-
"""
TabuPlus - 1800 Kartlık Tam Veritabanı Oluşturucu
18 Kategori x 100 Kart = 1800 Kart
"""

import json
import os
import sys

# Modülleri import et
from cat_tarih_cografya import TARİH, COĞRAFYA
from cat_bilim_din import BİLİM_UZAY, DİN_İNANÇ
from cat_edebiyat_felsefe import EDEBİYAT_ŞİİR, FELSEFE_MANTIK
from cat_mitoloji_tip import MİTOLOJİ_EFSANE, TIP_SAĞLIK
from cat_sinema_muzik import SİNEMA_DİZİ, MÜZİK_SANAT
from cat_spor_yemek import SPOR_OYUN, YEMEK_MUTFAK
from cat_teknoloji_ev import TEKNOLOJİ_DİJİTAL, GÜNLÜK_YAŞAM
from cat_meslek_doga import MESLEKLER, DOĞA_CANLILAR
from cat_deyim_populer import DEYİMLER_KAVRAMLAR, POPÜLER_KÜLTÜR

categories = [
    ("TARİH", TARİH),
    ("COĞRAFYA", COĞRAFYA),
    ("BİLİM & UZAY", BİLİM_UZAY),
    ("DİN & İNANÇ", DİN_İNANÇ),
    ("EDEBİYAT & ŞİİR", EDEBİYAT_ŞİİR),
    ("FELSEFE & MANTIK", FELSEFE_MANTIK),
    ("MİTOLOJİ & EFSANE", MİTOLOJİ_EFSANE),
    ("TIP & SAĞLIK", TIP_SAĞLIK),
    ("SİNEMA & DİZİ", SİNEMA_DİZİ),
    ("MÜZİK & SANAT", MÜZİK_SANAT),
    ("SPOR & OYUN", SPOR_OYUN),
    ("YEMEK & MUTFAK", YEMEK_MUTFAK),
    ("TEKNOLOJİ & DİJİTAL", TEKNOLOJİ_DİJİTAL),
    ("GÜNLÜK YAŞAM & EV", GÜNLÜK_YAŞAM),
    ("MESLEKLER", MESLEKLER),
    ("DOĞA & CANLILAR", DOĞA_CANLILAR),
    ("DEYİMLER & KAVRAMLAR", DEYİMLER_KAVRAMLAR),
    ("POPÜLER KÜLTÜR", POPÜLER_KÜLTÜR)
]

all_cards = []
card_id = 1

print("--- Kategori Kart Sayıları Kontrolü ---")
for cat_name, items in categories:
    count = len(items)
    print(f"[{cat_name}]: {count} kart")
    if count < 100:
        print(f"HATA: {cat_name} kategorisinde 100'den az kart var ({count})!")
        sys.exit(1)

    for idx, (word, forbidden) in enumerate(items[:100]):
        diff = "KOLAY" if idx < 35 else ("ORTA" if idx < 75 else "ZOR")
        all_cards.append({
            "id": card_id,
            "word": word.strip(),
            "forbidden": [f.strip() for f in forbidden[:5]],
            "category": cat_name,
            "difficulty": diff
        })
        card_id += 1

print(f"\nToplam Oluşturulan Kart Sayısı: {len(all_cards)}")

# JS Modülü Olarak cards/all_cards.js Dosyasına Yaz
output_path = os.path.join(os.path.dirname(__file__), "..", "cards", "all_cards.js")
js_content = "/**\n * TabuPlus - 1800 Kartlık Resmi Veritabanı\n * 18 Kategori x 100 Kart\n */\n\n"
js_content += "export const ALL_TABU_CARDS = " + json.dumps(all_cards, ensure_ascii=False, indent=2) + ";\n"

with open(output_path, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Başarıyla yazıldı: {output_path}")
