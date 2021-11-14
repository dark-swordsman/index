import { FC } from 'react'
import Link from 'next/link'
import { canEdit } from '../../lib/session'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useSession } from 'next-auth/client'
import { Types } from '../../types/Components'

type Props = {
  type: Types
  allowEdit: boolean
}

const CreateNewButton: FC<Props> = ({ type, allowEdit }) => {
  const [session] = useSession()
  return (
    allowEdit &&
    canEdit(session, type) && (
      <Link href={'/edit/' + type + '/_new'}>
        <a className={'btn btn-outline-success mb-2 me-2'}>
          <FontAwesomeIcon icon={['fas', 'plus']} /> Create a new {type}
        </a>
      </Link>
    )
  )
}

export default CreateNewButton
