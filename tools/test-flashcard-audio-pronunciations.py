#!/usr/bin/env python3
"""Regression checks for flashcard text-to-speech pronunciation rewrites."""

from __future__ import annotations

import importlib.util
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
GENERATOR_PATH = ROOT / "tools" / "generate-flashcard-audio.py"


def load_generator():
    spec = importlib.util.spec_from_file_location("flashcard_audio_generator", GENERATOR_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"Unable to load {GENERATOR_PATH}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def main() -> int:
    generator = load_generator()
    cases = {
        "CO2 emissions": "C O two emissions",
        "CO₂ emissions": "C O two emissions",
        "RNA, DNA and HIV": "R N A, D N A and H I V",
        "USB and MRI data": "U S B and M R I data",
        "IPCC and GDP": "I P C C and G D P",
        "565 AD": "565 A D",
        "ALH84001 meteorite": "A L H eight four zero zero one meteorite",
        "the fall of Louis XVI": "the fall of Louis the sixteenth",
        "the G8 nations": "the G eight nations",
        "updated NHW11 Prius": "updated N H W eleven Prius",
        "CaCO3": "calcium carbonate",
        "6-n-propylthiouracil": "six N propyl thiouracil",
        "print a 3D version of": "print a three D version of",
        "H+ ions": "H plus ions",
        "around 2°C to 5°C": "around 2 degrees Celsius to 5 degrees Celsius",
        "covering a 60 × 60-metre area": "covering a sixty by sixty metre area",
        "above 70 dBA": "above seventy D B A",
        "fMRI scans": "F M R I scans",
        "PhD research": "P H D research",
        "CFCs": "C F C's",
        "recover an mtDNA fingerprint": "recover an M T D N A fingerprint",
        "an estimated $500 million": "an estimated five hundred million dollars",
        "saved $3.5 million on": "saved three point five million dollars on",
        "£6 million": "six million pounds",
        "a $50 fine": "a fifty dollar fine",
        "under $1 per gallon": "under one dollar per gallon",
        "no more than three words and/or a number": "no more than three words and or a number",
        "strong IQs": "strong I Q scores",
        "COVID-19 and IELTS": "COVID nineteen and eye elts",
        "after World War II": "after World War Two",
        "cooperate with CARB": "cooperate with CARB",
        "Jianzi": "jee yen dzuh",
        "Kabaddi": "kuh buh dee",
        "Sepak Takraw": "suh pack tack raw",
        "Wushu": "woo shoo",
        "API level": "A P I level",
        "PR department": "P R department",
        "change the URL": "change the U R L",
        "such as LEDs": "such as L E D lights",
        "back in 1980": "back in nineteen eighty",
        "by the 1980s": "by the nineteen eighties",
        "measure 95 cm by 65 cm": "measure ninety-five centimetres by sixty-five centimetres",
        "−3%": "minus 3 percent",
        "8–9 units": "8 to 9 units",
        "solar/wind": "solar and wind",
        "530.7 billion kWh": "530.7 billion kilowatt-hours",
        "3–8 cm": "3 to 8 centimetres",
        "to a depth of 4.5 km": "to a depth of 4.5 kilometres",
        "$75,000–$99,999 group": "75,000 dollars to 99,999 dollars group",
        "producing…and consuming…": "producing a quantity and consuming another quantity",
        "at…for production": "at a figure for production",
        "generating…and using…": "generating a quantity and using another quantity",
        "produced…but consumed only…": "produced a quantity but consumed only another quantity",
        "with production between…and…": "with production between one figure and another",
        "converts the energy from…into…": "converts the energy from one form into another",
    }
    failures = []
    for display_text, expected in cases.items():
        actual = generator.spoken_text(display_text)
        if actual != expected:
            failures.append(f"{display_text!r}: expected {expected!r}, got {actual!r}")
    if failures:
        raise AssertionError("Pronunciation regressions:\n" + "\n".join(failures))
    print(f"Pronunciation checks passed: {len(cases)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
