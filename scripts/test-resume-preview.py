"""Dependency-free regression tests for the custom renderer's HTML preview."""
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
