"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type CompanySettings = {
  id?: number
  company_name: string
  phone: string
  email: string
  address: string
  logo_path?: string | null
  header_image_path?: string | null
  footer_image_path?: string | null
}

export default function SetupPage() {
  const [form, setForm] = useState<CompanySettings>({
    company_name: "",
    phone: "",
    email: "",
    address: "",
    logo_path: "",
    header_image_path: "",
    footer_image_path: "",
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [headerFile, setHeaderFile] = useState<File | null>(null)
  const [footerFile, setFooterFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load existing settings (row id=1 convention)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php/api/settings`)
        if (!res.ok) return
        const data = await res.json()
        if (data?.settings) {
          setForm({
            id: data.settings.id,
            company_name: data.settings.company_name || "",
            phone: data.settings.phone || "",
            email: data.settings.email || "",
            address: data.settings.address || "",
            logo_path: data.settings.logo_path || "",
            header_image_path: data.settings.header_image_path || "",
            footer_image_path: data.settings.footer_image_path || "",
          })
        }
      } catch (_) {
        // ignore for now; page should still render
      }
    }
    fetchSettings()
  }, [])

  const handleChange = (field: keyof CompanySettings, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setLogoFile(file)
  }

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setHeaderFile(file)
  }

  const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFooterFile(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company_name) {
      alert("Company name is required")
      return
    }

    setIsLoading(true)
    try {
      const fd = new FormData()
      fd.append("company_name", form.company_name)
      if (form.phone) fd.append("phone", form.phone)
      if (form.email) fd.append("email", form.email)
      if (form.address) fd.append("address", form.address)
      if (logoFile) fd.append("logo", logoFile) // backend saves under public/setup and returns relative path
      if (headerFile) fd.append("header_image", headerFile) // backend public/header
      if (footerFile) fd.append("footer_image", footerFile) // backend public/footer

      // If row exists, backend can upsert by id=1
      if (form.id) fd.append("id", String(form.id))

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/index.php/api/settings/save`, {
        method: "POST",
        body: fd,
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to save settings")
      }

      // reflect saved values
      if (data?.settings) {
        setForm((prev) => ({
          ...prev,
          id: data.settings.id,
          logo_path: data.settings.logo_path || prev.logo_path,
          header_image_path: data.settings.header_image_path || prev.header_image_path,
          footer_image_path: data.settings.footer_image_path || prev.footer_image_path,
        }))
      }
      alert("Company settings saved")
    } catch (err: any) {
      alert(err?.message || "Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-orange-500">Company Setup</h1>
        <p className="text-gray-600 mt-2">Store your company information that will be used across the app.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>About your business</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="company_name">Company name</Label>
                <Input
                  id="company_name"
                  value={form.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    placeholder="Company phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  placeholder="Street, City, State, Zip"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Brand assets */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Brand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="logo">Company logo</Label>
                <Input id="logo" type="file" accept="image/*" onChange={handleFileChange} />
                {form.logo_path && (
                  <p className="text-sm text-gray-500 mt-2">Current: {form.logo_path}</p>
                )}
              </div>
              <div>
                <Label htmlFor="headerImage">Receipt header image</Label>
                <Input id="headerImage" type="file" accept="image/*" onChange={handleHeaderChange} />
                {form.header_image_path && (
                  <p className="text-sm text-gray-500 mt-2">Current: {form.header_image_path}</p>
                )}
              </div>
              <div>
                <Label htmlFor="footerImage">Receipt footer image</Label>
                <Input id="footerImage" type="file" accept="image/*" onChange={handleFooterChange} />
                {form.footer_image_path && (
                  <p className="text-sm text-gray-500 mt-2">Current: {form.footer_image_path}</p>
                )}
              </div>
              <Separator />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Saving..." : "Save Settings"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}


