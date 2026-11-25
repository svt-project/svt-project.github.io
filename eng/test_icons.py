"""Regression tests for geometry invariants and visible image/code features."""
import copy
import unittest
from icon_artwork import GEOMETRY, png_path
from icon_checks import avatar_crop_errors, geometry_errors, pixel_errors, read_png


class IconAcceptanceTests(unittest.TestCase):
    def setUp(self):
        self.layouts = copy.deepcopy(GEOMETRY['layouts'])

    def test_current_geometry_meets_contract(self):
        self.assertEqual([], geometry_errors(self.layouts))

    def test_off_center_picture_is_rejected(self):
        for point in self.layouts['16']['file']['image']:
            point[0] += 1
        self.assertTrue(any('centered' in e for e in geometry_errors(self.layouts)))

    def test_brackets_cannot_meet_in_the_center(self):
        self.layouts['16']['bracket'][3][0] = 8
        self.assertTrue(any('center bridge' in e for e in geometry_errors(self.layouts)))

    def test_bracket_notch_cannot_close(self):
        self.layouts['16']['bracket'][4][0] = 7
        self.assertTrue(any('open notch' in e for e in geometry_errors(self.layouts)))

    def test_heavier_bracket_variants_are_rejected(self):
        old_bracket = [[9, 14], [5, 18], [9, 22], [11, 20], [9, 18], [11, 16]]
        for size, scale in ((24, 1), (48, 2)):
            with self.subTest(size=size):
                layouts = copy.deepcopy(self.layouts)
                layouts[str(size)]['bracket'] = [[x*scale, y*scale] for x, y in old_bracket]
                self.assertTrue(any('arm weight' in e for e in geometry_errors(layouts)))

    def test_bottom_clearance_is_enforced(self):
        for point in self.layouts['16']['bracket']:
            point[1] += 1
        self.assertTrue(any('clearance' in e for e in geometry_errors(self.layouts)))

    def test_fold_clearance_is_enforced(self):
        self.layouts['16']['sheet'][4] = 4
        self.assertTrue(any('fold' in e for e in geometry_errors(self.layouts)))

    def test_smallest_motif_requires_whole_pixel_vertices(self):
        self.layouts['16']['file']['image'][0][1] += 0.5
        self.assertTrue(any('whole pixels' in e for e in geometry_errors(self.layouts)))

    def test_missing_landscape_peak_is_rejected(self):
        self.layouts['20']['square']['image'][3][1] = 2
        self.assertTrue(any('peak' in e for e in geometry_errors(self.layouts)))

    def pixels(self):
        _, _, rows = read_png(png_path('file-ui', 16, 'light', 16).read_bytes())
        return [bytearray(row) for row in rows]

    def test_center_bridge_remains_solid(self):
        rows = self.pixels()
        rows[12][8*4:9*4] = rows[4][3*4:4*4]
        self.assertIn('Bracket center bridge does not survive rasterization', pixel_errors(rows, 16, 'file-ui', 1))

    def test_separator_remains_solid(self):
        rows = self.pixels()
        rows[8][8*4:9*4] = rows[4][3*4:4*4]
        self.assertIn('Image/code separator does not survive rasterization', pixel_errors(rows, 16, 'file-ui', 1))

    def test_filled_bracket_is_rejected(self):
        rows = self.pixels()
        for y in range(9, 15):
            for x in range(3, 7):
                rows[y][x*4:x*4+4] = rows[0][8*4:9*4]
        self.assertIn('Left bracket cutout is missing', pixel_errors(rows, 16, 'file-ui', 1))

    def test_closed_notch_is_rejected(self):
        rows = self.pixels()
        rows[12][6*4:7*4] = rows[4][3*4:4*4]
        self.assertIn('Bracket notch does not remain open', pixel_errors(rows, 16, 'file-ui', 1))

    def test_missing_picture_is_rejected(self):
        rows = self.pixels()
        for y in range(4, 8):
            for x in range(3, 13):
                rows[y][x*4:x*4+4] = rows[0][8*4:9*4]
        self.assertIn('Picture cutout is missing', pixel_errors(rows, 16, 'file-ui', 1))

    def test_missing_mountain_is_rejected(self):
        rows = self.pixels()
        rows[6][9*4:10*4] = rows[4][3*4:4*4]
        self.assertIn('Landscape mountain does not survive rasterization', pixel_errors(rows, 16, 'file-ui', 1))

    def test_corrupt_png_is_rejected(self):
        data = bytearray(png_path('file-ui', 16, 'light', 16).read_bytes())
        data[40] ^= 1
        with self.assertRaises(ValueError):
            read_png(data)

    def test_circular_crop_cannot_remove_avatar_foreground(self):
        _, _, rows = read_png(png_path('avatar-padded', 96, 'light', 96).read_bytes())
        rows = [bytearray(row) for row in rows]
        rows[0][0:4] = bytes.fromhex('173B45FF')
        self.assertIn('Circular crop would remove avatar artwork', avatar_crop_errors(rows, 'light'))

    def test_padded_avatar_still_requires_the_picture_and_code(self):
        _, _, rows = read_png(png_path('avatar-padded', 96, 'light', 96).read_bytes())
        rows = [bytes.fromhex('ECFAF6FF')*96 for _ in rows]
        self.assertIn('Picture cutout is missing', pixel_errors(rows, 96, 'avatar-padded', 1))


if __name__ == '__main__':
    unittest.main()
