"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getApiBaseUrl, getAuthToken, apiFetch } from "@/lib/api"

export default function ApiDebug() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testApiConnection = async () => {
    setLoading(true)
    const apiBase = getApiBaseUrl()
    const token = getAuthToken()
    
    try {
      // Test basic connection
      const response = await apiFetch("/booking")
      setTestResult({
        success: true,
        apiBase,
        hasToken: !!token,
        response: response,
        message: "API connection successful"
      })
    } catch (error: any) {
      setTestResult({
        success: false,
        apiBase,
        hasToken: !!token,
        error: error.message,
        status: error.status,
        url: error.url,
        message: "API connection failed"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>API Debug Information</CardTitle>
        <CardDescription>Test your API connection and configuration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">API Base URL:</p>
            <p className="text-sm text-muted-foreground">{getApiBaseUrl()}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Auth Token:</p>
            <Badge variant={getAuthToken() ? "default" : "destructive"}>
              {getAuthToken() ? "Present" : "Missing"}
            </Badge>
          </div>
        </div>

        <Button onClick={testApiConnection} disabled={loading} className="w-full">
          {loading ? "Testing..." : "Test API Connection"}
        </Button>

        {testResult && (
          <Card className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant={testResult.success ? "default" : "destructive"}>
                    {testResult.success ? "SUCCESS" : "FAILED"}
                  </Badge>
                  <span className="text-sm font-medium">{testResult.message}</span>
                </div>
                
                <div className="text-xs space-y-1">
                  <p><strong>API Base:</strong> {testResult.apiBase}</p>
                  <p><strong>Has Token:</strong> {testResult.hasToken ? "Yes" : "No"}</p>
                  
                  {testResult.success ? (
                    <div>
                      <p><strong>Response:</strong></p>
                      <pre className="bg-white p-2 rounded text-xs overflow-auto max-h-32">
                        {JSON.stringify(testResult.response, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div>
                      <p><strong>Error:</strong> {testResult.error}</p>
                      <p><strong>Status:</strong> {testResult.status}</p>
                      <p><strong>URL:</strong> {testResult.url}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}
