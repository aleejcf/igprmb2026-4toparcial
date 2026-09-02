#!/usr/bin/env perl
# FASE 5 (auditoria) - migra cada <img> de contenido a <picture> con
# AVIF/WebP + srcset de 3 anchos, usando las variantes ya generadas en
# imagenes-optim/ por scripts/optimize-images.mjs. No toca imagenes/
# (los originales quedan intactos como archivo).
use strict;
use warnings;
use File::Basename;

my $OPT_DIR = "imagenes-optim";
my $SIZES = "(max-width: 600px) 100vw, (max-width: 1100px) 50vw, 800px";
# imagenes/irmb/ es solo logos, insignias e iconos de UI (nunca fotos de
# contenido) -- nunca se muestran a mas de ~96px, asi que un "sizes"
# generico les hacia pedir la variante de 1600px para un icono de 44px.
my $ICON_SIZES = "96px";
my @files = glob("*.html");

my $total_wrapped = 0;
my $total_skipped_no_variant = 0;
my $total_skipped_other = 0;

for my $file (@files) {
  open(my $fh, "<:encoding(UTF-8)", $file) or do { warn "skip $file: $!\n"; next };
  local $/;
  my $html = <$fh>;
  close($fh);

  my $wrapped_here = 0;

  $html =~ s{(<img\b[^>]*>)}{
    my $tag = $1;
    my $result = $tag;

    if ($tag =~ /\bsrc\s*=\s*"([^"]*)"/) {
      my $src = $1;

      # No tocar: placeholders dinamicos, recursos externos, SVG,
      # o imagenes que ya viven en imagenes-optim (por si se corre dos veces).
      if ($src eq "" || $src =~ /^(https?:)?\/\// || $src =~ /^data:/
          || $src =~ /\.svg$/i || $src =~ /^\Q$OPT_DIR\E\//) {
        $result = $tag;
      } else {
        my $srcpath = $src;
        $srcpath =~ s/^\.\///;

        if ($srcpath =~ m{^imagenes/(.+)\.(jpe?g|png)$}i) {
          my $rel = $1; # ruta relativa sin extension, dentro de imagenes/
          my $dir = dirname($rel);
          my $base = basename($rel);
          my $optdir = ($dir eq ".") ? $OPT_DIR : "$OPT_DIR/$dir";

          my @avif; my @webp; my @jpg;
          for my $w (480, 960, 1600) {
            push @avif, "$optdir/$base-$w.avif $w" . "w" if -f "$optdir/$base-$w.avif";
            push @webp, "$optdir/$base-$w.webp $w" . "w" if -f "$optdir/$base-$w.webp";
            push @jpg,  ["$optdir/$base-$w.jpg", $w]     if -f "$optdir/$base-$w.jpg";
          }

          if (@avif && @webp && @jpg) {
            my $avif_srcset = join(", ", @avif);
            my $webp_srcset = join(", ", @webp);
            my $sizes = ($rel =~ m{^irmb/}) ? $ICON_SIZES : $SIZES;
            my ($fallback_path) = sort { $b->[1] <=> $a->[1] } @jpg;
            my $fallback_src = $fallback_path->[0];
            # Para iconos, el fallback tambien puede ser el mas chico --
            # nunca se muestran mas grandes que eso.
            if ($rel =~ m{^irmb/}) {
              my ($smallest) = sort { $a->[1] <=> $b->[1] } @jpg;
              $fallback_src = $smallest->[0];
            }

            my $img_tag = $tag;
            $img_tag =~ s/(\bsrc\s*=\s*")[^"]*(")/$1$fallback_src$2/;

            $result = qq{<picture>\n            <source type="image/avif" srcset="$avif_srcset" sizes="$sizes">\n            <source type="image/webp" srcset="$webp_srcset" sizes="$sizes">\n            $img_tag\n          </picture>};
            $wrapped_here++;
            $total_wrapped++;
          } else {
            $total_skipped_no_variant++;
          }
        } else {
          $total_skipped_other++;
        }
      }
    } else {
      $total_skipped_other++;
    }

    $result;
  }ge;

  if ($wrapped_here > 0) {
    open(my $out, ">:encoding(UTF-8)", $file) or die $!;
    print $out $html;
    close($out);
  }
  print "$file: +$wrapped_here\n";
}

print "\nTOTAL envueltas en <picture>: $total_wrapped\n";
print "Sin variante generada (sin tocar): $total_skipped_no_variant\n";
print "Otros (externas/vacias/svg/ya migradas): $total_skipped_other\n";
