import Head from "next/head"
import Navbar from "./Navbar"
import Footer from "./Footer"

export const siteName = "The Anime Index"

export default function Layout({children, error}) {
    const description = "The best places to stream your favorite anime shows online or download them for free and watch in sub or dub. Supports manga, light novels, hentai, and apps."
    return (
        <div className={"d-flex"}
             style={{
                 minHeight: "100vh",
                 flexDirection: "column"
             }}>
            <Head>
                <meta charSet="UTF-8"/>
                <meta content="IE=Edge" httpEquiv="X-UA-Compatible"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>

                <meta name="apple-mobile-web-app-capable" content="yes"/>
                <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
                <meta name="apple-mobile-web-app-title" content="index"/>
                <link rel="apple-touch-icon" sizes="180x180"
                      href="/favicon/apple-touch-icon.png"/>

                <link rel="icon" type="image/png" sizes="32x32"
                      href="/favicon/favicon-32x32.png"/>
                <link rel="icon" type="image/png" sizes="16x16"
                      href="/favicon/favicon-16x16.png"/>
                <link rel="mask-icon" href="/favicon/safari-pinned-library.svg" color="#484848"/>
                <meta name="msapplication-TileColor" content="#2b5797"/>
                <meta name="theme-color" content="#000000"/>

                <link rel="manifest" href="/manifest.json"/>

                {error ?
                    <title>
                        Error {error} | {siteName}
                    </title> : <></>}
                <meta name="description" content={description}/>
                <meta name="robots" content="index, archive, follow"/>
                <meta name="twitter:site" content="@ranimepiracy"/>
                <meta name="twitter:title" content={"The Anime Index"}/>
                <meta name="twitter:description" content={description}/>
                <meta name="twitter:image" content={"/icon/logo.png"}/>

                <link rel="preconnect" href="https://cdn.jsdelivr.net"/>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/css/bootstrap.min.css"
                      rel="stylesheet"
                      integrity="sha384-KyZXEAg3QhqLMpG8r+8fhAXLRk2vvoC2f3B09zVXn8CA5QIVfZOJ3BCsw2P0p/We"
                      crossOrigin="anonymous"/>
            </Head>
            <div className={"align-items-stretch d-flex w-100"}>
                <header>
                    <Navbar/>
                </header>
                <div className={"w-100"}>
                    <div className={"container my-4"}>
                        <main>{children}</main>
                    </div>
                    <Footer error={error}/>
                </div>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.0/dist/js/bootstrap.bundle.min.js"
                    integrity="sha384-U1DAWAznBHeqEIlVSCgzq+c9gqGAJn5c/t99JyeKa9xxaYpSvHU5awsuZVVFIhvj"
                    crossOrigin="anonymous"/>

        </div>
    )
}
