-- CreateTable
CREATE TABLE "SiteImage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "pagePath" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SiteImage_pagePath_category_idx" ON "SiteImage"("pagePath", "category");
