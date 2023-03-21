import { json, type RequestEvent } from "@sveltejs/kit";

export function POST(req: RequestEvent){
  return json({myRes: 'yup'})
}