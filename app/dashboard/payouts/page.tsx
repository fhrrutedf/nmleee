import { redirect } from 'next/navigation';

export default function PayoutsPage() {
    redirect('/dashboard/earnings');
}                        {payout.completedAt
                                                ? new Date(payout.completedAt).toLocaleDateString('ar-EG')
                                                : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
