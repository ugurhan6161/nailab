import { Link } from 'react-router-dom';
import { Box, Typography, Chip } from '@mui/material';
import type { Product } from '../lib/supabase';
import { PRODUCT_NAME } from '../lib/productContent';

type Props = { product: Product };

export default function ProductCard({ product }: Props) {
  const isDemo = product.name === PRODUCT_NAME || product.id === 'nailab-profesyonel-egitim-kiti-ornek';
  const canBuy = product.price > 0 && product.stock > 0;
  const hasImage = Boolean(product.image_url);

  return (
    <Link to={`/urun/${product.id}`} style={{ display: 'block', height: '100%' }}>
      <Box sx={{
        bgcolor: '#FFFFFF',
        border: '1px solid #DBCEC2',
        borderRadius: 2,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 200ms ease',
        '&:hover': { borderColor: '#8B6950' },
      }}>
        <Box sx={{
          position: 'relative',
          aspectRatio: '1 / 1',
          bgcolor: '#EAE1D7',
          overflow: 'hidden',
        }}>
          {hasImage ? (
            <Box
              component="img"
              src={product.image_url}
              alt={product.name}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Box sx={{
              width: '100%', height: '100%', display: 'grid', placeItems: 'center', p: 2,
            }}>
              <Box sx={{
                width: '70%', aspectRatio: '1 / 1', borderRadius: '50%',
                border: '1.5px solid #A9876D', display: 'grid', placeItems: 'center',
                textAlign: 'center', p: 2, animation: 'ringReveal 700ms ease-out both',
              }}>
                <Typography variant="caption" sx={{ color: '#60432E', fontWeight: 500, lineHeight: 1.4 }}>
                  Ürün fotoğrafı<br />admin panelinden<br />eklenecek
                </Typography>
              </Box>
            </Box>
          )}
          {isDemo && (
            <Chip
              label="Örnek ürün"
              size="small"
              sx={{
                position: 'absolute', top: 10, left: 10,
                bgcolor: '#EED2BC', color: '#60432E', fontWeight: 500,
              }}
            />
          )}
        </Box>
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 0.5, flex: 1 }}>
          <Typography sx={{ fontWeight: 400, fontSize: '1rem', color: '#000000', lineHeight: 1.3 }}>
            {product.name}
          </Typography>
          {canBuy ? (
            <Typography sx={{ fontWeight: 500, fontSize: '1.05rem', color: '#000000' }}>
              {product.price.toLocaleString('tr-TR')} ₺
            </Typography>
          ) : (
            <Typography sx={{ fontSize: '0.8rem', color: '#5E564D' }}>
              Fiyat ve stok bilgisi admin panelinden girilecek
            </Typography>
          )}
        </Box>
      </Box>
    </Link>
  );
}
