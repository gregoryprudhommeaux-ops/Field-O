import React from 'react'

import { cn } from './ui'

const LOGO_SRC = '/field-o-logo.svg'

export function BrandMark({
  className,
  imgClassName,
  alt = 'FIELD-O',
}: {
  className?: string
  imgClassName?: string
  alt?: string
}) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      width={128}
      height={128}
      decoding="async"
      aria-hidden={alt === '' ? true : undefined}
      className={cn('shrink-0 object-contain', imgClassName, className)}
    />
  )
}
