import Layout, {siteName} from "../components/layout/Layout"
import Head from "next/head"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import React from "react"
import DataBadge from "../components/data/DataBadge"
import UserBoard from "../components/boards/UserBoard"
import useSWR from "swr"
import Loader from "../components/loading"

export default function Users() {

    const {data: users, error} = useSWR("/api/users")
    if (error) {
        return <div>failed to load</div>
    }
    if (!users) {
        return <Loader/>
    }

    return <Layout>
        <Head>
            <title>
                {"Users | " + siteName}
            </title>
        </Head>

        <div className={"card bg-2 mb-3"}>
            <div className="card-body">
                <h2 className={"card-title"}>
                    <FontAwesomeIcon icon={["fas", "users"]}/> The whole community
                    <div className={"float-end"} style={{fontSize: "1.2rem"}}>
                        <DataBadge name={users.length + " user" + (users.length > 1 ? "s" : "")} style={"primary"}/>
                    </div>
                </h2>
            </div>
        </div>

        <UserBoard users={users} allUsers={users}/>
    </Layout>
}

export async function getStaticProps() {
    return {
        props: {},
        revalidate: 10
    }
}
