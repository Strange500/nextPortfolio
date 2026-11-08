"""Dependency-free regression tests for the custom renderer's HTML preview."""
import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


class PreviewTests(unittest.TestCase):
    def test_html_preview_is_html_without_weasyprint(self):
        with tempfile.TemporaryDirectory() as directory:
            for lang in ("en", "fr"):
                with self.subTest(lang=lang):
                    output = Path(directory) / f"resume-{lang}.html"
                    result = subprocess.run(
                        [sys.executable, "-S", str(ROOT / "scripts/render-resume.py"),
                         str(ROOT / f"resume-{lang}.json"), str(output),
                         "--html", "--lang", lang],
                        capture_output=True, text=True, check=False,
                    )
                    self.assertEqual(result.returncode, 0, result.stderr)
                    content = output.read_text()
                    self.assertTrue(content.startswith("<!DOCTYPE html>"))
                    self.assertIn(f'<html lang="{lang}">', content)
                    self.assertIn("Inter-Regular.ttf", content)
                    self.assertNotIn("<img", content)

    def test_toeic_moves_to_header_without_inventing_or_repeating_facts(self):
        spec = importlib.util.spec_from_file_location("renderer", ROOT / "scripts/render-resume.py")
        assert spec is not None and spec.loader is not None
        renderer = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(renderer)
        for lang in ("en", "fr"):
            with self.subTest(lang=lang):
                data = json.loads((ROOT / f"resume-{lang}.json").read_text())
                original = json.dumps(data, sort_keys=True)
                language = next(item for item in data["languages"] if "TOEIC" in item["fluency"])
                content = renderer.render(data, "A4", lang=lang)
                header = content.split("<header>")[1].split("</header>")[0]
                self.assertIn('class="language-highlight"', header)
                self.assertIn(language["language"], header)
                self.assertIn(language["fluency"], header)
                self.assertEqual(content.count("TOEIC 980/990"), 1)
                self.assertEqual(json.dumps(data, sort_keys=True), original)
                # The renderer must use source data, not a hardcoded score or CEFR claim.
                language["fluency"] = "Professional — TOEIC 950/990"
                changed = renderer.render(data, "A4", lang=lang)
                self.assertIn("TOEIC 950/990", changed)
                self.assertNotIn("980/990", changed)
                language["fluency"] = "Professional"
                absent = renderer.render(data, "A4", lang=lang).split("<body>")[1]
                self.assertNotIn('class="language-highlight"', absent)
                self.assertNotIn("TOEIC", absent)
                self.assertNotIn("C1", content)
                self.assertNotIn("C2", content)

    def test_universal_renderer_preview_flags(self):
        with tempfile.TemporaryDirectory() as directory:
            for lang in ("en", "fr"):
                for flag in ([], ["--html"]):
                    with self.subTest(lang=lang, flag=flag):
                        output = Path(directory) / f"resume-{lang}.html"
                        result = subprocess.run(
                            ["node", str(ROOT / "scripts/render-resume.mjs"),
                             "--resume", str(ROOT / f"resume-{lang}.json"),
                             "--output", str(output), "--lang", lang, *flag],
                            capture_output=True, text=True, check=False,
                        )
                        self.assertEqual(result.returncode, 0, result.stderr)
                        self.assertTrue(output.read_text().startswith("<!DOCTYPE html>"))


if __name__ == "__main__":
    unittest.main()
