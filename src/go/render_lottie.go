package main

import (
	"image"
	"image/color"
	"image/gif"
	"os"

	lottie "github.com/Benau/go_rlottie"
)

// https://github.com/Benau/tgsconverter/blob/master/libtgsconverter/lib.go#L69
func imageFromBuffer(p []byte, w uint, h uint) *image.RGBA {
	// rlottie use ARGB32_Premultiplied
	for i := 0; i < len(p); i += 4 {
		p[i+0], p[i+2] = p[i+2], p[i+0]
	}
	m := image.NewRGBA(image.Rect(0, 0, int(w), int(h)))
	m.Pix = p
	m.Stride = int(w) * 4
	return m
}

func renderLottie(inputPath string, outputPath string) {
	input, err := os.ReadFile(inputPath)
	if err != nil {
		panic(err)
	}

	output, err := os.Create(outputPath)
	if err != nil {
		panic(err)
	}

	animation := lottie.LottieAnimationFromData(string(input), inputPath, inputPath)
	width, height := lottie.LottieAnimationGetSize(animation)

	frameCount := float32(lottie.LottieAnimationGetTotalframe(animation))
	frameRate := float32(lottie.LottieAnimationGetFramerate(animation))

	// max gif frame rate
	if frameRate > 50 {
		frameRate = 50
	}

	duration := frameCount / frameRate
	step := 1.0 / frameRate

	var frames []image.Image
	for i := float32(0); i < duration; i += step {
		rawFrame := lottie.LottieAnimationGetFrameAtPos(animation, i/duration)
		frame := make([]byte, width*height*4)
		lottie.LottieAnimationRender(animation, rawFrame, frame, width, height, width*4)
		frames = append(frames, imageFromBuffer(frame, width, height))
	}

	q := medianCutQuantizer{mode, nil, false}
	p := q.quantizeMultiple(make([]color.Color, 0, 256), frames)

	var trans_idx uint8 = 0
	if q.reserveTransparent {
		trans_idx = uint8(len(p))
	}

	g := gif.GIF{}
	g.Config.Width = int(width)
	g.Config.Height = int(height)
	id_map := make(map[uint32]uint8)

	for _, f := range frames {
		pf := image.NewPaletted(f.Bounds(), p)
		for y := 0; y < f.Bounds().Dy(); y++ {
			for x := 0; x < f.Bounds().Dx(); x++ {
				c := f.At(x, y)
				cr, cg, cb, ca := c.RGBA()
				cid := (cr>>8)<<16 | cg | (cb >> 8)
				if q.reserveTransparent && ca == 0 {
					pf.Pix[pf.PixOffset(x, y)] = trans_idx
				} else if val, ok := id_map[cid]; ok {
					pf.Pix[pf.PixOffset(x, y)] = val
				} else {
					val := uint8(p.Index(c))
					pf.Pix[pf.PixOffset(x, y)] = val
					id_map[cid] = val
				}
			}
		}

		g.Image = append(g.Image, pf)
		g.Delay = append(g.Delay, int(1/50.*100.))
		g.Disposal = append(g.Disposal, gif.DisposalBackground)
	}

	if q.reserveTransparent {
		p = append(p, color.RGBA{0, 0, 0, 0})
	}

	for _, i := range g.Image {
		i.Palette = p
	}

	g.Config.ColorModel = p
	if err := gif.EncodeAll(output, &g); err != nil {
		panic(err)
	}
}